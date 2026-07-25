import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

const IS_VERCEL = !!process.env.VERCEL;
const CACHE_BASE = IS_VERCEL
  ? path.join("/tmp", ".cache", "images")
  : path.join(process.cwd(), ".cache", "images");
const ORIGINALS_DIR = path.join(CACHE_BASE, "originals");
const PROCESSED_DIR = path.join(CACHE_BASE, "processed");
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FETCH_TIMEOUT_MS = 10_000; // 10 s
const MAX_SOURCE_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_PIXEL_COUNT = 40_000_000; // ~6700 × 6000
const DEFAULT_QUALITY = 80;
const MAX_WIDTH = 2000;

// Supabase Configuration & Helper
const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/$/, "");
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY
  "";
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET;
const HAS_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

const ALLOWED_HOSTS: ReadonlySet<string> | null = (() => {
  const extra =
    process.env.IMAGE_PROXY_ALLOWED_HOSTS?.split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean) ?? [];

  return extra.length > 0 ? new Set(["res.cloudinary.com", ...extra]) : null;
})();

const PRIVATE_HOST_RE: RegExp[] = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^::1$/i,
  /^\[::1\]$/i,
];

const TRANSPARENT_WEBP = Buffer.from(
  "UklGRkgAAABXRUJQVlA4WAoAAAAQAAAABwAHAAQUAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
  "base64",
);

let _cacheDirReady: Promise<boolean> | null = null;

function ensureCacheDirs(): Promise<boolean> {
  if (_cacheDirReady) return _cacheDirReady;
  _cacheDirReady = (async () => {
    try {
      await fs.mkdir(ORIGINALS_DIR, { recursive: true });
      await fs.mkdir(PROCESSED_DIR, { recursive: true });
      return true;
    } catch (err) {
      console.error("[Image Proxy] Cannot create cache dirs:", err);
      return false;
    }
  })();
  return _cacheDirReady;
}

function parseIntParam(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = parseInt(raw ?? "", 10);
  return Math.min(Math.max(Number.isNaN(n) ? fallback : n, min), max);
}

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function makeETag(buf: Buffer): string {
  return `"${crypto.createHash("sha256").update(buf).digest("hex").slice(0, 32)}"`;
}

type ValidationResult =
  | { ok: true; url: URL; isRelative: boolean; relativePath?: string }
  | { ok: false; reason: string };

function validateSource(src: string, baseUrl?: string): ValidationResult {
  let url: URL;
  let isRelative = false;
  let relativePath = "";

  if (src.startsWith("/") || !/^https?:\/\//i.test(src)) {
    relativePath = src.startsWith("/") ? src : `/${src}`;
    const normalized = path.normalize(relativePath).replace(/\\/g, "/");
    if (normalized.includes("..")) {
      return { ok: false, reason: "Invalid relative path traversal" };
    }
    try {
      url = new URL(relativePath, baseUrl || "http://localhost");
      isRelative = true;
    } catch {
      return { ok: false, reason: "Malformed relative path" };
    }
  } else {
    try {
      url = new URL(src);
    } catch {
      return { ok: false, reason: "Malformed URL" };
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, reason: "Only http/https allowed" };
    }

    const host = url.hostname.toLowerCase();

    for (const re of PRIVATE_HOST_RE) {
      if (re.test(host)) {
        return { ok: false, reason: "Private or reserved host blocked" };
      }
    }

    if (ALLOWED_HOSTS && !ALLOWED_HOSTS.has(host)) {
      return { ok: false, reason: `Host "${host}" is not in the allowlist` };
    }
  }

  return { ok: true, url, isRelative, relativePath };
}

function sanitizeBasename(src: string): string {
  try {
    const url =
      src.startsWith("/") || !/^https?:\/\//i.test(src)
        ? new URL(src.startsWith("/") ? src : `/${src}`, "http://localhost")
        : new URL(src);
    const base = path.basename(url.pathname).replace(/\.[^.]+$/, "");
    const clean = base.replace(/[^a-zA-Z0-9-]/g, "_");
    return clean.slice(0, 50) || "img";
  } catch {
    return "img";
  }
}

function originalCachePath(src: string): string {
  const name = sanitizeBasename(src);
  const hash = sha256(src).slice(0, 12);
  return path.join(ORIGINALS_DIR, `${name}_${hash}.bin`);
}

function processedCachePath(
  src: string,
  width: number,
  quality: number,
): string {
  const name = sanitizeBasename(src);
  const hash = sha256(`${src}:w${width}:q${quality}`).slice(0, 12);
  return path.join(PROCESSED_DIR, `${name}_${hash}_w${width}_q${quality}.webp`);
}

function supabaseObjectKey(
  src: string,
  width: number,
  quality: number,
  isOriginal = false,
): string {
  const name = sanitizeBasename(src);
  if (isOriginal) {
    const hash = sha256(src).slice(0, 12);
    return `originals/${name}_${hash}.bin`;
  }
  const hash = sha256(`${src}:w${width}:q${quality}`).slice(0, 12);
  return `processed/${name}_${hash}_w${width}_q${quality}.webp`;
}

// Supabase Storage REST helpers
async function fetchFromSupabase(key: string): Promise<Buffer | null> {
  if (!HAS_SUPABASE) return null;
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch (err) {
    console.warn("[Image Proxy] Supabase fetch error:", err);
    return null;
  }
}

async function uploadToSupabase(
  key: string,
  data: Buffer,
  contentType: string,
): Promise<string | null> {
  if (!HAS_SUPABASE) return null;
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body: new Uint8Array(data),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.warn(`[Image Proxy] Supabase upload error (${res.status}):`, txt);
      return null;
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`;
  } catch (err) {
    console.warn("[Image Proxy] Supabase upload exception:", err);
    return null;
  }
}

async function readCached(filePath: string): Promise<Buffer | null> {
  try {
    const stats = await fs.stat(filePath);
    if (Date.now() - stats.mtimeMs > CACHE_TTL_MS) return null;
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function atomicWrite(targetPath: string, data: Buffer): Promise<void> {
  const tmp = `${targetPath}.${crypto.randomBytes(8).toString("hex")}.tmp`;
  try {
    await fs.writeFile(tmp, data);
    await fs.rename(tmp, targetPath);
  } catch (err) {
    await fs.unlink(tmp).catch(() => {});
    throw err;
  }
}

async function tryCacheWrite(filePath: string, data: Buffer): Promise<void> {
  const canCache = await ensureCacheDirs();
  if (!canCache) return;
  try {
    await atomicWrite(filePath, data);
  } catch (err) {
    console.warn("[Image Proxy] Local cache write failed:", filePath, err);
  }
}

async function readCachedSmart(
  src: string,
  width: number,
  quality: number,
  isOriginal = false,
): Promise<Buffer | null> {
  if (HAS_SUPABASE) {
    const key = supabaseObjectKey(src, width, quality, isOriginal);
    const buf = await fetchFromSupabase(key);
    if (buf && buf.byteLength > 0) return buf;
  }
  const localPath = isOriginal
    ? originalCachePath(src)
    : processedCachePath(src, width, quality);
  return await readCached(localPath);
}

async function writeCachedSmart(
  src: string,
  width: number,
  quality: number,
  data: Buffer,
  contentType = "image/webp",
  isOriginal = false,
): Promise<void> {
  if (HAS_SUPABASE) {
    const key = supabaseObjectKey(src, width, quality, isOriginal);
    uploadToSupabase(key, data, contentType).catch((err) =>
      console.warn("[Image Proxy] Background Supabase cache error:", err),
    );
  }
  const localPath = isOriginal
    ? originalCachePath(src)
    : processedCachePath(src, width, quality);
  tryCacheWrite(localPath, data).catch(() => {});
}

function imageResponse(
  buf: Buffer,
  etagValue: string,
  cacheStatus: "HIT" | "MISS",
  contentType = "image/webp",
): NextResponse {
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buf.byteLength),
      "Cache-Control": "public, max-age=604800, s-maxage=31536000, immutable",
      ETag: etagValue,
      "X-Cache": cacheStatus,
      "X-Storage-Backend": HAS_SUPABASE ? "supabase" : "local-tmp",
    },
  });
}

function notModifiedResponse(etagValue: string): NextResponse {
  return new NextResponse(null, {
    status: 304,
    headers: {
      ETag: etagValue,
      "Cache-Control": "public, max-age=604800, s-maxage=31536000, immutable",
    },
  });
}

async function processingImage(
  req: NextRequest,
  { params }: { params: Promise<{ src: string }> },
): Promise<NextResponse> {
  const { src: encodedSrc } = await params;
  const src = decodeURIComponent(encodedSrc ?? "").trim();

  if (!src) {
    return new NextResponse("Missing image source", { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const width = parseIntParam(searchParams.get("w"), 0, 0, MAX_WIDTH);
  const quality = parseIntParam(searchParams.get("q"), DEFAULT_QUALITY, 1, 100);
  const serveOriginal = searchParams.get("original") === "true";

  const validation = validateSource(src, req.url);
  if (!validation.ok) {
    return new NextResponse(`Invalid source: ${validation.reason}`, {
      status: 400,
    });
  }

  if (serveOriginal) {
    const originalBuf = await readCachedSmart(src, width, quality, true);
    if (originalBuf) {
      const tag = makeETag(originalBuf);
      if (req.headers.get("if-none-match") === tag) return notModifiedResponse(tag);
      const meta = await sharp(originalBuf).metadata().catch(() => null);
      const mime = meta?.format === "svg" ? "image/svg+xml" : meta?.format ? `image/${meta.format}` : "application/octet-stream";
      return imageResponse(originalBuf, tag, "HIT", mime);
    }
  }

  const cached = !serveOriginal
    ? await readCachedSmart(src, width, quality, false)
    : null;

  if (cached) {
    const tag = makeETag(cached);
    if (req.headers.get("if-none-match") === tag)
      return notModifiedResponse(tag);
    return imageResponse(cached, tag, "HIT");
  }
  let inputBuffer = await readCachedSmart(src, width, quality, true);

  if (!inputBuffer) {
    if (validation.isRelative && validation.relativePath) {
      const publicFilePath = path.join(process.cwd(), "public", validation.relativePath);
      try {
        inputBuffer = await fs.readFile(publicFilePath);
      } catch {
        // Fall back to fetch below if disk read fails
      }
    }

    if (!inputBuffer) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const fetchTarget = validation.isRelative ? validation.url.toString() : src;
      let response: Response;
      try {
        response = await fetch(fetchTarget, { signal: controller.signal });
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return new NextResponse("Upstream timeout", { status: 504 });
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        return new NextResponse(`Upstream error: ${response.statusText}`, {
          status: response.status,
        });
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/") && !contentType.includes("svg")) {
        return new NextResponse(
          `Source URL did not return an image (got: ${contentType})`,
          { status: 422 },
        );
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_SOURCE_BYTES) {
        return new NextResponse("Source image exceeds size limit", {
          status: 413,
        });
      }

      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        return new NextResponse("Empty response from upstream", { status: 502 });
      }
      if (arrayBuffer.byteLength > MAX_SOURCE_BYTES) {
        return new NextResponse("Source image exceeds size limit", {
          status: 413,
        });
      }

      inputBuffer = Buffer.from(arrayBuffer);
    }

    const origMime = "application/octet-stream";
    await writeCachedSmart(src, width, quality, inputBuffer, origMime, true);

    if (serveOriginal) {
      const tag = makeETag(inputBuffer);
      if (req.headers.get("if-none-match") === tag) return notModifiedResponse(tag);
      const meta = await sharp(inputBuffer).metadata().catch(() => null);
      const mime = meta?.format === "svg" ? "image/svg+xml" : meta?.format ? `image/${meta.format}` : "application/octet-stream";
      return imageResponse(inputBuffer, tag, "MISS", mime);
    }
  }

  let pipeline = sharp(inputBuffer).rotate();
  const meta = await pipeline.metadata();

  const pixelCount = (meta.width ?? 0) * (meta.height ?? 0);
  if (pixelCount > MAX_PIXEL_COUNT) {
    return new NextResponse(
      "Source image dimensions are too large to process",
      {
        status: 413,
      },
    );
  }

  if (width > 0 && meta.width && width < meta.width) {
    pipeline = pipeline.resize(width, null, { fit: "inside" });
  }

  const effectiveQuality = Math.min(quality || DEFAULT_QUALITY, 90);
  const outputBuffer = await pipeline.webp({ quality: effectiveQuality }).toBuffer();
  const tag = makeETag(outputBuffer);

  await writeCachedSmart(src, width, quality, outputBuffer, "image/webp", false);

  if (req.headers.get("if-none-match") === tag) return notModifiedResponse(tag);

  return imageResponse(outputBuffer, tag, "MISS");
}

async function proxyImage(
  req: NextRequest,
  ctx: { params: Promise<{ src: string }> },
): Promise<NextResponse> {
  try {
    return await processingImage(req, ctx);
  } catch (error: any) {
    if (error?.digest) throw error;

    console.error("[Image Proxy] Unhandled error:", error);

    createErrorResponse("Failed to process Image", 500, { req, error });

    return new NextResponse(new Uint8Array(TRANSPARENT_WEBP), {
      status: 500,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
      },
    });
  }
}

export const GET = withAPIMiddleware(proxyImage);
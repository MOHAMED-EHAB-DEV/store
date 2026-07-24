import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

let sharp: any = null;
try {
  sharp = require("sharp");
} catch {
  // sharp native C++ addon unavailable in Cloudflare Workers / Edge environment
}
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
const DEFAULT_QUALITY = 90;
const MAX_WIDTH = 2000;

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

type ValidationResult = { ok: true; url: URL } | { ok: false; reason: string };

function validateSource(src: string): ValidationResult {
  let url: URL;
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

  return { ok: true, url };
}

function sanitizeBasename(src: string): string {
  try {
    const url = new URL(src);
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
    console.warn("[Image Proxy] Cache write failed:", filePath, err);
  }
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

  const validation = validateSource(src);
  if (!validation.ok) {
    return new NextResponse(`Invalid source: ${validation.reason}`, {
      status: 400,
    });
  }

  const oPath = originalCachePath(src);

  if (serveOriginal) {
    const originalBuf = await readCached(oPath);
    if (originalBuf) {
      const tag = makeETag(originalBuf);
      if (req.headers.get("if-none-match") === tag) return notModifiedResponse(tag);
      const meta = await sharp(originalBuf).metadata();
      const mime = meta.format === "svg" ? "image/svg+xml" : meta.format ? `image/${meta.format}` : "application/octet-stream";
      return imageResponse(originalBuf, tag, "HIT", mime);
    }
  }

  const pPath = processedCachePath(src, width, quality);
  const cached = !serveOriginal ? await readCached(pPath) : null;

  if (cached) {
    const tag = makeETag(cached);
    if (req.headers.get("if-none-match") === tag)
      return notModifiedResponse(tag);
    return imageResponse(cached, tag, "HIT");
  }
  let inputBuffer = await readCached(oPath);

  if (!inputBuffer) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(src, { signal: controller.signal });
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
    if (!contentType.startsWith("image/")) {
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

    await tryCacheWrite(oPath, inputBuffer);

    if (serveOriginal || !sharp) {
      const tag = makeETag(inputBuffer);
      if (req.headers.get("if-none-match") === tag) return notModifiedResponse(tag);
      const mime = sharp ? (await sharp(inputBuffer).metadata()).format : null;
      const contentType = mime === "svg" ? "image/svg+xml" : mime ? `image/${mime}` : "image/jpeg";
      return imageResponse(inputBuffer, tag, "MISS", contentType);
    }
  }

  if (!sharp) {
    const tag = makeETag(inputBuffer);
    if (req.headers.get("if-none-match") === tag) return notModifiedResponse(tag);
    return imageResponse(inputBuffer, tag, "MISS");
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

  const outputBuffer = await pipeline.webp({ quality }).toBuffer();
  const tag = makeETag(outputBuffer);

  await tryCacheWrite(pPath, outputBuffer);

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
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

const CACHE_DIR = process.env.VERCEL
  ? path.join("/tmp", ".cache", "images")
  : path.join(process.cwd(), ".cache", "images");

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    return true;
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    console.error(
      `[Image Proxy] Failed to create cache dir: ${CACHE_DIR}`,
      err,
    );
    return false;
  }
}

/**
 * Validates if a URL is safe to fetch (basic SSRF protection)
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function generateUniqueCacheKey(src: string, width: number, quality: number) {
  return crypto
    .createHash("md5")
    .update(`${src}-${width}-${quality}`)
    .digest("hex");
}

async function proxyImage(
  req: NextRequest,
  { params }: { params: Promise<{ src: string }> },
) {
  let src = "";
  try {
    const { src: encodedSrc } = await params;
    src = decodeURIComponent(encodedSrc);

    const { searchParams } = new URL(req.url);
    const width = Math.min(
      Math.max(parseInt(searchParams.get("w") || "0"), 0),
      2000,
    ); // Sanitize width
    const quality = Math.min(
      Math.max(parseInt(searchParams.get("q") || "80"), 1),
      100,
    ); // Sanitize quality

    if (!src) {
      return new NextResponse("Missing image source", { status: 400 });
    }

    if (!isSafeUrl(src)) {
      return new NextResponse("Invalid or unsafe image source", {
        status: 400,
      });
    }

    // Create a unique cache key based on URL, width, and quality
    const cacheKey = generateUniqueCacheKey(src, width, quality);

    const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.webp`);

    // Check if cached file exists and is not expired
    try {
      const stats = await fs.stat(cacheFilePath);
      const isExpired = Date.now() - stats.mtimeMs > SEVEN_DAYS_MS;

      if (!isExpired) {
        const fileBuffer = await fs.readFile(cacheFilePath);
        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=604800, immutable",
            "X-Cache": "HIT",
          },
        });
      }
    } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
      // File doesn't exist, proceed to fetch
    }

    // Fetch the original image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(src, { signal: controller.signal }).finally(
      () => clearTimeout(timeoutId),
    );

    if (!response.ok) {
      console.error(
        `[Image Proxy] Failed to fetch source: ${src} (Status: ${response.status})`,
      );
      return new NextResponse(
        `Failed to fetch source image: ${response.statusText}`,
        { status: response.status },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
      throw new Error("Received empty response from source image");
    }

    const inputBuffer = Buffer.from(arrayBuffer);

    // Initialize sharp
    let pipeline = sharp(inputBuffer);

    // Metadata to check original dimensions
    const metadata = await pipeline.metadata();

    // Resize if width is provided and smaller than original
    if (width > 0 && metadata.width && width < metadata.width) {
      pipeline = pipeline.resize(width, null, {
        withoutEnlargement: true,
        fit: "inside",
      });
    }

    // Optimize and convert to WebP
    const outputBuffer = await pipeline.webp({ quality }).toBuffer();

    // Save to cache asynchronously (don't block the response)
    // We try to create the dir and write the file, but if it fails (read-only FS),
    // we just log and continue serving the image.
    ensureCacheDir().then(async (canCache) => {
      if (canCache) {
        try {
          await fs.writeFile(cacheFilePath, outputBuffer);
        } catch (writeErr) {
    if (writeErr && typeof writeErr === 'object' && 'digest' in writeErr) throw writeErr;
          console.error(
            `[Image Proxy] Cache write failed for ${src}:`,
            writeErr,
          );
        }
      }
    });

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=604800, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    if (error.name === "AbortError") {
      console.error(`[Image Proxy] Timeout fetching: ${src}`);
      return new NextResponse("Request Timeout", { status: 504 });
    }

    console.error(`[Image Proxy] Error:`, error);

    createErrorResponse("Failed to process Image", 500, {
      req: req,
      error: error,
    });

    // Return a generic 1x1 transparent WebP as fallback to prevent broken UI
    const transparentPixel = Buffer.from(
      "UklGRkgAAABXRUJQVlA4WAoAAAAQAAAABwAHAAQUAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
      "base64",
    );

    return new NextResponse(new Uint8Array(transparentPixel), {
      status: 500,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "no-store",
      },
    });
  }
}

export const GET = withAPIMiddleware(proxyImage);

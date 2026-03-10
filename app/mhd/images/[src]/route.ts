import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10000; // 10 seconds

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    // Already exists or can't create
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

export async function GET(
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
    const cacheKey = crypto
      .createHash("md5")
      .update(`${src}-${width}-${quality}`)
      .digest("hex");

    const cacheFilePath = path.join(CACHE_DIR, `${cacheKey}.webp`);

    await ensureCacheDir();

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
      pipeline = pipeline.resize(width, null, { withoutEnlargement: true });
    }

    // Optimize and convert to WebP
    const outputBuffer = await pipeline.webp({ quality }).toBuffer();

    // Save to cache
    await fs.writeFile(cacheFilePath, outputBuffer);

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=604800, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error(`[Image Proxy] Timeout fetching: ${src}`);
      return new NextResponse("Request Timeout", { status: 504 });
    }

    console.error(`[Image Proxy] Error:`, error);

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

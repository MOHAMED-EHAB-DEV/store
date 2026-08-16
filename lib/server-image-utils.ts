import sharp from "sharp";
import { generateGradientStyle, rgbToHex } from "./image-utils";

/**
 * Server-side color and gradient extraction using sharp.
 * Fetches an image buffer or takes an existing buffer, resizes to a 3x3 pixel grid,
 * and extracts corner, edge, and center dominant hex colors.
 */
export async function extractColorsFromServerBuffer(
  buffer: Buffer | ArrayBuffer
): Promise<{
  gradientColors: string[];
  gradientStyle: string;
}> {
  try {
    const inputBuffer = Buffer.isBuffer(buffer)
      ? buffer
      : Buffer.from(new Uint8Array(buffer));
    const { data, info } = await sharp(inputBuffer)
      .resize(3, 3, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const channels = info.channels;
    const getHex = (index: number) => {
      const offset = index * channels;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      return rgbToHex(r, g, b);
    };

    // 3x3 grid:
    // 0 = top-left,   1 = top-center,    2 = top-right
    // 3 = mid-left,   4 = center,        5 = mid-right
    // 6 = bottom-left,7 = bottom-center, 8 = bottom-right
    const colors = [
      getHex(0), // Top-left corner
      getHex(2), // Top-right corner
      getHex(4), // Center
      getHex(8), // Bottom-right corner
      getHex(6), // Bottom-left corner
    ];

    const uniqueColors = Array.from(new Set(colors)).slice(0, 4);
    const gradientStyle = generateGradientStyle(uniqueColors);

    return {
      gradientColors: uniqueColors,
      gradientStyle,
    };
  } catch (error) {
    console.error("Server color extraction error:", error);
    return {
      gradientColors: [],
      gradientStyle: generateGradientStyle([]),
    };
  }
}

/**
 * Fetches an image from an external URL and extracts its dominant gradient colors.
 */
export async function extractColorsFromImageUrl(imageUrl: string): Promise<{
  gradientColors: string[];
  gradientStyle: string;
}> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await extractColorsFromServerBuffer(arrayBuffer);
  } catch (error) {
    console.error(`Failed to extract gradient from ${imageUrl}:`, error);
    return {
      gradientColors: [],
      gradientStyle: generateGradientStyle([]),
    };
  }
}

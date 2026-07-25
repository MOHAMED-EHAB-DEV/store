/**
 * Constructs a URL for the custom high-performance image proxy.
 *
 * The full encoded source URL is used as the route segment.
 *
 * @param original if true, returns the original image URL
 * @returns The proxied image URL
 */
import { ImageLoaderProps } from "next/image";

export const createImageProxyLoader =
  (original = false) =>
  ({ src, width, quality }: ImageLoaderProps): string => {
    if (!src) return "";
    if (src.startsWith("data:") || src.startsWith("blob:")) return src;

    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    if (quality) params.set("q", quality.toString());
    if (original) params.set("original", "true");

    const queryString = params.toString();
    const encodedSrc = encodeURIComponent(src);

    return `/mhd/images/${encodedSrc}${queryString ? `?${queryString}` : ""}`;
  };

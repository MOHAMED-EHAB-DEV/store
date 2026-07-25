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

/**
 * Generates a single proxy URL for a given image source, width, and quality.
 */
export const getImageProxyUrl = (
  src: string,
  width?: number,
  quality = 80,
  original = false
): string => {
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

/**
 * Generates a standard HTML `srcset` string across target widths.
 */
export const DEFAULT_IMAGE_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536, 1920];

export const getImageSrcSet = (
  src: string,
  widths: number[] = DEFAULT_IMAGE_WIDTHS,
  quality = 80
): string => {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return "";

  return widths
    .map((w) => `${getImageProxyUrl(src, w, quality)} ${w}w`)
    .join(", ");
};

/**
 * Returns attributes for a native <img> element along with preload link props.
 */
export const getImageProps = (params: {
  src: string;
  widths?: number[];
  sizes?: string;
  quality?: number;
  defaultWidth?: number;
  original?: boolean;
}) => {
  const {
    src,
    widths = DEFAULT_IMAGE_WIDTHS,
    sizes = "100vw",
    quality = 80,
    defaultWidth = 1024,
    original = false,
  } = params;

  const srcSet = getImageSrcSet(src, widths, quality);
  const fallbackUrl = getImageProxyUrl(src, defaultWidth, quality, original);

  return {
    imgProps: {
      src: fallbackUrl,
      srcSet,
      sizes,
    },
    preloadProps: {
      rel: "preload",
      as: "image",
      href: fallbackUrl,
      imageSrcSet: srcSet,
      imageSizes: sizes,
      fetchPriority: "high" as const,
    },
  };
};

export const getZeroJSImageProps = getImageProps;


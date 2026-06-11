/**
 * Constructs a URL for the custom high-performance image proxy.
 *
 * The full encoded source URL is used as the route segment.
 *
 * @param src     The source image URL
 * @param options Optimization options (width, quality)
 * @returns The proxied image URL
 */
export const anyImgUrl = (
  src: string,
  options: { width?: number; quality?: number } = {},
): string => {
  if (!src) return "";

  const baseUrl = "/mhd/images";
  const params = new URLSearchParams();

  if (options.width) params.set("w", options.width.toString());
  if (options.quality) params.set("q", options.quality.toString());

  const queryString = params.toString();
  const suffix = queryString ? `?${queryString}` : "";

  // Handle relative paths — make them absolute for the proxy to fetch
  let absoluteSrc = src;
  if (src.startsWith("/")) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    absoluteSrc = `${appUrl}${src}`;
  }

  // Default: encode the full source URL as the path segment
  return `${baseUrl}/${encodeURIComponent(absoluteSrc)}${suffix}`;
};

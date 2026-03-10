/**
 * Constructs a URL for the custom high-performance image proxy.
 * 
 * @param src The source image URL
 * @param options Optimization options (width, quality)
 * @returns The proxied image URL
 */
export const anyImgUrl = (src: string, options: { width?: number; quality?: number } = {}) => {
  if (!src) return "";
  
  // If it's already a relative path or local, return as is (optional)
  // But for this system, we want to proxy everything for consistency
  
  const baseUrl = "/mhd/images";
  const params = new URLSearchParams();
  
  if (options.width) params.set("w", options.width.toString());
  if (options.quality) params.set("q", options.quality.toString());
  
  const queryString = params.toString();
  
  // Handle relative paths for server-side fetching
  let absoluteSrc = src;
  if (src.startsWith("/")) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    absoluteSrc = `${appUrl}${src}`;
  }
  
  // We encode the source URL as a segment of the path
  return `${baseUrl}/${encodeURIComponent(absoluteSrc)}${queryString ? `?${queryString}` : ""}`;
};

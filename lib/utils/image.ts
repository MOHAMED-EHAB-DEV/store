const UPLOADTHING_HOSTS = new Set(["https://7ve6btemdp.ufs.sh/f", "https://utfs.io/f"]);
/**
 * Constructs a URL for the custom high-performance image proxy.
 *
 * For UploadThing CDN URLs the last path segment (file key / ID) is used
 * as the route segment, keeping the proxy URL short.  The route handler
 * reconstructs the full CDN URL from that key.
 *
 * For every other URL the full encoded source URL is used as before.
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

  // For UploadThing CDN URLs pass only the file key as the route segment
  try {
    const parsed = new URL(absoluteSrc);
    if (UPLOADTHING_HOSTS.has(parsed.hostname)) {
      const fileKey = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
      if (fileKey) {
        // Prefix with "ut:" so the route handler knows it's an UploadThing key
        return `${baseUrl}/ut:${encodeURIComponent(fileKey)}${suffix}`;
      }
    }
  } catch {
    // Not a valid URL — fall through to the full-URL encoding below
  }

  // Default: encode the full source URL as the path segment
  return `${baseUrl}/${encodeURIComponent(absoluteSrc)}${suffix}`;
};

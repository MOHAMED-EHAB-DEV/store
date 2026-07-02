import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Uploads a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  file: File | Blob | Buffer,
  folder: string = "uploads",
  resourceType: "auto" | "image" | "video" | "raw" = "auto"
): Promise<any> {
  const buffer = Buffer.isBuffer(file) 
    ? file 
    : Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Generates a signed, expiring download URL for a private Cloudinary raw resource.
 *
 * @param fileKey The public ID (e.g. "templates/template-name.zip")
 * @param expiresInSeconds Duration in seconds for the link validity (default 60s)
 * @returns The signed download URL
 */
export function generateSignedDownloadUrl(fileKey: string, expiresInSeconds: number = 60): string | null {
  if (!fileKey) return null;

  try {
    // Extract format if extension is present in the fileKey
    const format = fileKey.split(".").pop() || "zip";
    // Cloudinary private download needs format separate from public ID
    const publicId = fileKey.endsWith(`.${format}`)
      ? fileKey.slice(0, -(format.length + 1))
      : fileKey;

    const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
      resource_type: "raw",
      type: "private",
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed download URL:", error);
    return null;
  }
}

import { useState } from "react";

export interface CloudinaryUploadResponse {
  url: string;
  ufsUrl: string; // for compatibility
  key: string;    // public_id for template download key compatibility
}

interface UploadHookOptions {
  onClientUploadComplete?: (res: CloudinaryUploadResponse[]) => void;
  onUploadError?: (error: Error) => void;
  folder?: string;
  type?: string;
  resourceType?: string;
}

export function useCloudinaryUpload(
  endpoint: string,
  options?: UploadHookOptions
) {
  const [isUploading, setIsUploading] = useState(false);

  const startUpload = async (files: File[]): Promise<CloudinaryUploadResponse[] | undefined> => {
    setIsUploading(true);
    try {
      const uploadResults: CloudinaryUploadResponse[] = [];

      for (const file of files) {
        // Determine folder and type based on endpoint and file type
        let folder = options?.folder || "uploads";
        let type = options?.type || "upload";
        let resourceType = options?.resourceType || "image";

        if (endpoint === "profilePicture") {
          folder = "profile_pictures";
        }

        // For templates / raw file uploads, check file extension
        const isZip = file.name.endsWith(".zip") || file.name.endsWith(".rar");
        if (isZip) {
          folder = "templates";
          type = "private"; // Keep templates private / authenticated
          resourceType = "raw";
        } else if (file.type && !file.type.startsWith("image/")) {
          // Fallback for non-image files if any
          resourceType = "raw";
        }

        // 1. Get signed signature from server
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder, type }),
        });

        if (!signRes.ok) {
          const signErr = await signRes.json();
          throw new Error(signErr.error || "Failed to generate upload signature");
        }

        const signData = await signRes.json();

        // 2. Upload file to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signData.api_key);
        formData.append("timestamp", signData.timestamp.toString());
        formData.append("signature", signData.signature);
        if (signData.folder) formData.append("folder", signData.folder);
        if (signData.type) formData.append("type", signData.type);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/${resourceType}/upload`;
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.error?.message || "Failed to upload file to Cloudinary");
        }

        const uploadData = await uploadRes.json();
        
        uploadResults.push({
          url: uploadData.secure_url,
          ufsUrl: uploadData.secure_url,
          key: uploadData.public_id,
        });
      }

      options?.onClientUploadComplete?.(uploadResults);
      return uploadResults;
    } catch (error: any) {
      console.error("Cloudinary client upload error:", error);
      const err = error instanceof Error ? error : new Error(error?.message || "Upload failed");
      options?.onUploadError?.(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    startUpload,
    isUploading,
    routeConfig: undefined, // to prevent destructuring failures
  };
}

// Export the alias as well to prevent compilation errors if any file imports useUploadThing
export const useUploadThing = useCloudinaryUpload;

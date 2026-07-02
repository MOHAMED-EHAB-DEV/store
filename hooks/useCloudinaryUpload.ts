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
        let folder = options?.folder || "uploads";
        let type = options?.type || "upload";
        let resourceType = options?.resourceType || "image";

        if (endpoint === "profilePicture") {
          folder = "profile_pictures";
        }

        const isZip = file.name.endsWith(".zip") || file.name.endsWith(".rar");
        if (isZip) {
          folder = "templates";
          type = "private";
          resourceType = "raw";
        } else if (file.type && !file.type.startsWith("image/")) {
          resourceType = "raw";
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append("type", type);
        formData.append("resourceType", resourceType);

        const uploadRes = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json();
          throw new Error(uploadErr.message || uploadErr.error || "Failed to upload file");
        }

        const uploadData = await uploadRes.json();
        const data = uploadData.data;
        
        uploadResults.push({
          url: data.secure_url,
          ufsUrl: data.secure_url,
          key: data.public_id,
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

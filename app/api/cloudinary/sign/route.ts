import { NextRequest } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { v2 as cloudinary } from "cloudinary";
import { createAPIResponse, createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function signCloudinary(req: NextRequest) {
  try {
    const user = await authenticateUser(false, true);
    if (!user) {
      return createErrorResponse("Unauthorized", 401, {
        req: req,
        error: "Unauthorized",
      });
    }

    const body = await req.json();
    const { folder, type } = body;

    const timestamp = Math.floor(Date.now() / 1000);

    // Build params to sign.
    // Important: Cloudinary requires all parameters that are sent in the client upload
    // call (except file, api_key, resource_type, signature) to be included in the signature.
    const paramsToSign: Record<string, any> = {
      timestamp,
    };
    if (folder) paramsToSign.folder = folder;
    if (type) paramsToSign.type = type;

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return createAPIResponse({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      type,
    });
  } catch (err: any) {
    console.error("Cloudinary sign error:", err);
    return createErrorResponse("Failed to sign", 500, {
      req: req,
      error: err,
    });
  }
}

export const POST = withAPIMiddleware(signCloudinary);


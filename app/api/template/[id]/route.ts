import { NextRequest } from "next/server";
import Review from "@/lib/models/Review";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  withAPIMiddleware,
  createErrorResponse,
  createAPIResponse,
} from "@/lib/utils/api-helpers";
import revalidate from "@/actions/revalidateTag";

type RouteContext = { params: Promise<{ id: string }> };

async function getTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get("isActive") === "true";
  try {
    await connectToDatabase();

    const [template, totalReviews] = await Promise.all([
      Template.findOne({ _id: id, isActive })
        .select("+content")
        .populate("categories", "_id name slug")
        .lean(),
      Review.countDocuments({ template: id }),
    ]);

    return createAPIResponse(template ? { ...template, reviews: totalReviews } : null);
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getPublicTemplate",
    });
  }
}


async function updateTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      for (const [key, value] of formData.entries()) {
        if (key === 'categories' || key === 'tags') {
          if (!body[key]) body[key] = [];
          body[key].push(value as string);
        } else if (key !== 'thumbnailFile' && key !== 'templateFile' && key !== 'thumbnailUrl' && key !== 'fileKeyStr') {
          if (value === 'true') body[key] = true;
          else if (value === 'false') body[key] = false;
          else if (key === 'price') body[key] = parseFloat(value as string) || 0;
          else body[key] = value;
        }
      }

      const thumbnailFile = formData.get("thumbnailFile") as File | null;
      const templateFile = formData.get("templateFile") as File | null;
      const thumbnailUrl = formData.get("thumbnailUrl") as string | null;
      const fileKeyStr = formData.get("fileKeyStr") as string | null;

      if (thumbnailFile) {
          const uploadResult = await uploadToCloudinary(thumbnailFile, "templates_thumbnails", "image");
          body.thumbnail = uploadResult.secure_url;
      } else if (thumbnailUrl) {
          body.thumbnail = thumbnailUrl;
      }

      if (templateFile) {
          const isZip = templateFile.name.endsWith(".zip") || templateFile.name.endsWith(".rar");
          const uploadResult = await uploadToCloudinary(
              templateFile, 
              isZip ? "templates" : "uploads", 
              isZip ? "raw" : "auto"
          );
          body.fileKey = uploadResult.public_id;
      } else if (fileKeyStr) {
          body.fileKey = fileKeyStr;
      }
    } else {
      body = await req.json();
    }

    const updated = await Template.findByIdAndUpdate(id, body, { new: true });

    revalidate(`template-${id}`);

    return createAPIResponse(
      updated,
      {
        message: "Template Updated Successfully",
      },
    );
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "updatePublicTemplate",
    });
  }
}

async function disableTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndUpdate(id, {
      isActive: false,
    }); // soft delete

    revalidate(`template-${id}`);

    return createAPIResponse(
      {},
      {
        message: "Template disabled successfully",
      },
    );
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "disablePublicTemplate",
    });
  }
}

async function deleteTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndDelete(id); // Delete from database

    revalidate(`template-${id}`);

    return createAPIResponse(
      {},
      {
        message: "Template deleted successfully",
      },
    );
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "deletePublicTemplate",
    });
  }
}

export const GET = withAPIMiddleware(getTemplate);
export const PATCH = withAPIMiddleware(updateTemplate);
export const POST = withAPIMiddleware(disableTemplate);
export const DELETE = withAPIMiddleware(deleteTemplate);

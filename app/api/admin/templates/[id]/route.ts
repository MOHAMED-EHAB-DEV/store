import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import Category from "@/lib/models/Category";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { uploadToGoogleDrive } from "@/lib/google-drive";

async function deleteAdminTemplate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();

    const template = await Template.findByIdAndDelete(id);

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    if (template.categories) {
      await Category.updateMany(
        { _id: { $in: template.categories } },
        { $inc: { templateCount: -1 } },
      );
    }

    await revalidateWithTag(`template-${id}`);
    if (template.slug) {
      await revalidateWithTag(`template-${template.slug}`);
      await revalidate(`/templates/${template.slug}`);
    }
    await revalidateWithTag("everyTemplate");
    await revalidateWithTag("categories");
    await revalidate("/templates");
    await revalidate("/");

    return createAPIResponse(null, {
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "adminDeleteTemplate",
    });
  }
}

async function updateAdminTemplate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();

    const formData = await req.formData();
    const body: any = {};

    for (const [key, value] of formData.entries()) {
      if (key === "categories" || key === "tags") {
        if (!body[key]) body[key] = [];
        body[key].push(value as string);
      } else if (
        key !== "thumbnailFile" &&
        key !== "templateFile" &&
        key !== "demoVideoFile" &&
        key !== "thumbnailUrl" &&
        key !== "demoVideoUrl" &&
        key !== "fileKeyStr"
      ) {
        if (value === "true") body[key] = true;
        else if (value === "false") body[key] = false;
        else if (key === "price") body[key] = parseFloat(value as string) || 0;
        else body[key] = value;
      }
    }

    const thumbnailFile = formData.get("thumbnailFile") as File | null;
    const templateFile = formData.get("templateFile") as File | null;
    const demoVideoFile = formData.get("demoVideoFile") as File | null;
    const thumbnailUrl = formData.get("thumbnailUrl") as string | null;
    const demoVideoUrl = formData.get("demoVideoUrl") as string | null;
    const fileKeyStr = formData.get("fileKeyStr") as string | null;

    if (thumbnailFile) {
      const uploadResult = await uploadToCloudinary(
        thumbnailFile,
        "templates_thumbnails",
        "image",
      );
      body.thumbnail = uploadResult.secure_url;
    } else if (thumbnailUrl) {
      body.thumbnail = thumbnailUrl;
    }

    if (demoVideoFile) {
      const uploadResult = await uploadToCloudinary(
        demoVideoFile,
        "templates_demo_videos",
        "video",
      );
      body.demoVideo = uploadResult.secure_url;
    } else if (demoVideoUrl) {
      body.demoVideo = demoVideoUrl;
    }

    if (templateFile) {
      const driveFileId = await uploadToGoogleDrive(templateFile);
      body.fileKey = driveFileId;
    } else if (fileKeyStr) {
      body.fileKey = fileKeyStr;
    }

    const template = await Template.findByIdAndUpdate(
      id,
      { $set: body },
      { runValidators: true },
    );

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    // If categories are changed, exactly calculate additions and removals
    if (body.categories) {
      const oldCats = (template.categories || []).map((c: any) => c.toString());
      const newCats = body.categories.map((c: any) => c.toString());

      const added = newCats.filter((c: string) => !oldCats.includes(c));
      const removed = oldCats.filter((c: string) => !newCats.includes(c));

      // console.log(added, removed);

      if (removed.length > 0) {
        await Category.updateMany(
          { _id: { $in: removed } },
          { $inc: { templateCount: -1 } },
        );
      }

      if (added.length > 0) {
        await Category.updateMany(
          { _id: { $in: added } },
          { $inc: { templateCount: 1 } },
        );
      }
    }

    await revalidateWithTag(`template-${id}`);
    if (template.slug) {
      await revalidateWithTag(`template-${template.slug}`);
      await revalidate(`/templates/${template.slug}`);
    }
    if (body.slug && body.slug !== template.slug) {
      await revalidateWithTag(`template-${body.slug}`);
      await revalidate(`/templates/${body.slug}`);
    }
    await revalidateWithTag("everyTemplate");
    await revalidateWithTag("categories");
    await revalidate("/templates");
    await revalidate("/");

    return createAPIResponse(template, {
      message: "Template updated successfully",
    });
  } catch (error: any) {
    // console.log(error);
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "adminUpdateTemplate",
    });
  }
}

async function getAdminTemplate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();

    const template = await Template.findById(id)
      .select(
        "title description content categories tags demoLink demoVideo price thumbnail type",
      )
      .lean();

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    return createAPIResponse(template);
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "adminGetTemplate",
    });
  }
}

async function disableTemplate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

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

export const DELETE = withAPIMiddleware(deleteAdminTemplate);
export const PATCH = withAPIMiddleware(updateAdminTemplate);
export const GET = withAPIMiddleware(getAdminTemplate);
export const POST = withAPIMiddleware(disableTemplate);

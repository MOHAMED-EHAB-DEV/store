import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";
import { revalidateTag } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary";

async function getAdminTemplates(request: NextRequest) {
  try {
    await connectToDatabase();

    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { searchParams } = new URL(request.url);
    const { limit, skip, page } = validatePagination(request);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");

    // Build query
    const query: any = {};
    if (category) query.categories = category;
    if (tier === "premium") query.price = { $gt: 0 };
    if (tier === "free") query.price = 0;
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [templates, total, stats] = await Promise.all([
      Template.find(query)
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(query),
      Template.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
            premium: { $sum: { $cond: [{ $gt: ["$price", 0] }, 1, 0] } },
            totalDownloads: { $sum: "$downloads" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            active: 1,
            premium: 1,
            totalDownloads: 1,
          },
        },
      ]),
    ]);

    return createAPIResponse(
      {
        items: templates,
        stats: stats[0] || {
          total: 0,
          active: 0,
          premium: 0,
          totalDownloads: 0,
        },
      },
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error: error,
      operation: "adminGetTemplates",
    });
  }
}

async function createAdminTemplate(req: NextRequest) {
  try {
    const user = await authenticateUser();

    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();
    
    const formData = await req.formData();
    const body: any = {};
    
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

    const template = await Template.create({
      ...body,
      author: user._id,
      downloads: 0,
      averageRating: 0,
      reviewCount: 0,
      views: 0,
    });

    revalidateTag("templates", "max");

    return createAPIResponse(template, {
      message: "Template created successfully",
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "adminCreateTemplate",
    });
  }
}

export const GET = withAPIMiddleware(getAdminTemplates);
export const POST = withAPIMiddleware(createAdminTemplate);

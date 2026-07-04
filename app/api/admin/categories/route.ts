import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateUser } from "@/middleware/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { revalidateWithTag } from "@/actions/revalidateTag";
import { uploadToCloudinary } from "@/lib/cloudinary";

// GET /api/admin/categories - List all categories
async function getAdminCategories(request: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (!includeInactive) query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [categories, total, stats] = await Promise.all([
      Category.find(query)
        .sort({ sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(query),
      Category.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            inactive: { $sum: { $cond: ["$isActive", 0, 1] } },
            totalTemplates: { $sum: "$templateCount" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            active: 1,
            inactive: 1,
            totalTemplates: 1,
          },
        },
      ]),
    ]);
    
    return createAPIResponse(
      {
        data: categories,
        stats: stats[0] || {
          total: 0,
          active: 0,
          inactive: 0,
          totalTemplates: 0,
        },
      },
      {
        message: "Categories fetched successfully",
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, { req: request, error, operation: "adminGetCategories" });
  }
}

// POST /api/admin/categories - Create new category
async function createCategory(request: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    await connectToDatabase();

    let body: any = {};
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (key !== "iconFile" && key !== "iconUrl") {
          if (value === "true") body[key] = true;
          else if (value === "false") body[key] = false;
          else body[key] = value;
        }
      }
      const iconFile = formData.get("iconFile") as File | null;
      const iconUrl = formData.get("iconUrl") as string | null;

      if (iconFile) {
        const uploadResult = await uploadToCloudinary(iconFile, "categories_icons", "image");
        body.icon = uploadResult.secure_url;
      } else if (iconUrl) {
        body.icon = iconUrl;
      }
    } else {
      body = await request.json();
    }

    const { name, description, slug, sortOrder, parentCategory, isActive, icon } = body;

    if (!name) {
      return createErrorResponse("Category name is required", 400, {
        req: request,
      });
    }

    // Auto-generate slug if not provided
    const categorySlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const category = await Category.create({
      name,
      description,
      slug: categorySlug,
      sortOrder: sortOrder || 0,
      parentCategory: parentCategory || null,
      isActive: isActive ?? true,
      icon: icon || undefined,
    });

    await revalidateWithTag("categories");

    return createAPIResponse(category, {
      message: "Category created successfully",
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return createErrorResponse(
        "Category with this name or slug already exists",
        400,
        { req: request, error },
      );
    }
    return createErrorResponse("Something went wrong", 500, { req: request, error, operation: "adminCreateCategory" });
  }
}

export const GET = withAPIMiddleware(getAdminCategories);
export const POST = withAPIMiddleware(createCategory);

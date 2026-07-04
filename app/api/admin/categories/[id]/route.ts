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

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function getCategory(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { id } = await params;
    await connectToDatabase();

    const category = await Category.findById(id).lean();

    if (!category) {
      return createErrorResponse("Category not found", 404, { req: request });
    }

    return createAPIResponse(category);
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error,
      operation: "adminGetCategory",
    });
  }
}

async function updateCategory(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await request.json();

    const { name, description, slug, sortOrder, parentCategory, isActive, icon } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (slug) updateData.slug = slug;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (parentCategory !== undefined)
      updateData.parentCategory = parentCategory || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (icon !== undefined) updateData.icon = icon;

    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) {
      return createErrorResponse("Category not found", 404, { req: request });
    }

    await revalidateWithTag("categories");
    
    return createAPIResponse(category, {
      message: "Category updated successfully",
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return createErrorResponse(
        "Category with this name or slug already exists",
        400,
        { req: request, error },
      );
    }
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error,
      operation: "adminUpdateCategory",
    });
  }
}

async function deleteCategory(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { id } = await params;
    await connectToDatabase();

    // Soft delete - set isActive to false
    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!category) {
      return createErrorResponse("Category not found", 404, { req: request });
    }

    await revalidateWithTag("categories");
    
    return createAPIResponse(null, {
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error,
      operation: "adminDeleteCategory",
    });
  }
}

export const GET = withAPIMiddleware(getCategory);
export const PUT = withAPIMiddleware(updateCategory);
export const DELETE = withAPIMiddleware(deleteCategory);

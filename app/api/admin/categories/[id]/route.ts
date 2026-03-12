import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

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

        return NextResponse.json({ success: true, data: category });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminGetCategory" });
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
        const { name, description, slug, sortOrder, parentCategory, isActive } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (slug) updateData.slug = slug;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
        if (parentCategory !== undefined) updateData.parentCategory = parentCategory || null;
        if (isActive !== undefined) updateData.isActive = isActive;

        const category = await Category.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).lean();

        if (!category) {
            return createErrorResponse("Category not found", 404, { req: request });
        }

        return NextResponse.json({
            success: true,
            data: category,
            message: "Category updated successfully",
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        if (error.code === 11000) {
            return createErrorResponse("Category with this name or slug already exists", 400, { req: request, error });
        }
        return handleApiError(error, request, { operation: "adminUpdateCategory" });
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
            { new: true }
        );

        if (!category) {
            return createErrorResponse("Category not found", 404, { req: request });
        }

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminDeleteCategory" });
    }
}

export const GET = withAPIMiddleware(getCategory);
export const PUT = withAPIMiddleware(updateCategory);
export const DELETE = withAPIMiddleware(deleteCategory);


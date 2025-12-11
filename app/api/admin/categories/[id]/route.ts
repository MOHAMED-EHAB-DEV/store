import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateUser } from "@/middleware/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const category = await Category.findById(id).lean();

        if (!category) {
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: category });
    } catch (error: any) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch category" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
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
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category,
            message: "Category updated successfully",
        });
    } catch (error: any) {
        console.error("Error updating category:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Category with this name or slug already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: error.message || "Failed to update category" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/categories/[id] - Delete category (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
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
            return NextResponse.json(
                { success: false, message: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete category" },
            { status: 500 }
        );
    }
}

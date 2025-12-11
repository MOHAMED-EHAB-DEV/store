import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateUser } from "@/middleware/auth";

// GET /api/admin/categories - List all categories
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
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

        const [categories, total] = await Promise.all([
            Category.find(query)
                .sort({ sortOrder: 1, name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: categories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const { name, description, slug, sortOrder, parentCategory, isActive } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, message: "Category name is required" },
                { status: 400 }
            );
        }

        // Auto-generate slug if not provided
        const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        const category = await Category.create({
            name,
            description,
            slug: categorySlug,
            sortOrder: sortOrder || 0,
            parentCategory: parentCategory || null,
            isActive: isActive ?? true,
        });

        return NextResponse.json(
            { success: true, data: category, message: "Category created successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating category:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "Category with this name or slug already exists" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: error.message || "Failed to create category" },
            { status: 500 }
        );
    }
}

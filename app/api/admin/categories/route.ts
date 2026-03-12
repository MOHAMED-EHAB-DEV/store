import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

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
                        totalTemplates: { $sum: "$templateCount" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total: 1,
                        active: 1,
                        inactive: 1,
                        totalTemplates: 1
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: categories,
            stats: stats[0] || { total: 0, active: 0, inactive: 0, totalTemplates: 0 },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminGetCategories" });
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

        const body = await request.json();
        const { name, description, slug, sortOrder, parentCategory, isActive } = body;

        if (!name) {
            return createErrorResponse("Category name is required", 400, { req: request });
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
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        if (error.code === 11000) {
            return createErrorResponse("Category with this name or slug already exists", 400, { req: request, error });
        }
        return handleApiError(error, request, { operation: "adminCreateCategory" });
    }
}

export const GET = withAPIMiddleware(getAdminCategories);
export const POST = withAPIMiddleware(createCategory);


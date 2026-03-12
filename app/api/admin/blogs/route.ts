import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getAdminBlogs(req: NextRequest) {
    try {
        const user = await authenticateUser(true, true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search");
        const status = searchParams.get("status");
        const category = searchParams.get("category");

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};
        if (status === "published") query.isPublished = true;
        if (status === "draft") query.isPublished = false;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { excerpt: { $regex: search, $options: "i" } },
            ];
        }

        const [blogs, total, stats] = await Promise.all([
            Blog.find(query)
                .populate("author", "name email")
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            Blog.countDocuments(query),
            Blog.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        published: { $sum: { $cond: ["$isPublished", 1, 0] } },
                        drafts: { $sum: { $cond: ["$isPublished", 0, 1] } },
                        totalViews: { $sum: "$views" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total: 1,
                        published: 1,
                        drafts: 1,
                        totalViews: 1
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            message: "Blogs fetched successfully",
            data: blogs,
            stats: stats[0] || { total: 0, published: 0, drafts: 0, totalViews: 0 },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "adminGetBlogs" });
    }
}

export const GET = withAPIMiddleware(getAdminBlogs);


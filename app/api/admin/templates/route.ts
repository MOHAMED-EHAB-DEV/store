import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getAdminTemplates(request: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const tier = searchParams.get("tier");
        const status = searchParams.get("status");

        const skip = (page - 1) * limit;

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
                        active: { $sum: { $cond: ["$isActive", 1, 0] } },
                        premium: { $sum: { $cond: [{ $gt: ["$price", 0] }, 1, 0] } },
                        totalDownloads: { $sum: "$downloads" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total: 1,
                        active: 1,
                        premium: 1,
                        totalDownloads: 1
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: templates,
            stats: stats[0] || { total: 0, active: 0, premium: 0, totalDownloads: 0 },
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminGetTemplates" });
    }
}

async function createAdminTemplate(req: NextRequest) {
    try {
        const user = await authenticateUser();

        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();
        const body = await req.json();

        const template = await Template.create({
            ...body,
            author: user._id,
            downloads: 0,
            averageRating: 0,
            reviewCount: 0,
            views: 0,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Template created successfully",
                data: template,
            },
            { status: 201 }
        );
    } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
        return handleApiError(err, req, { operation: "adminCreateTemplate" });
    }
}

export const GET = withAPIMiddleware(getAdminTemplates);
export const POST = withAPIMiddleware(createAdminTemplate);


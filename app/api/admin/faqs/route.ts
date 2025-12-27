import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";

// GET /api/admin/faqs - List all FAQs with pagination
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
        const limit = parseInt(searchParams.get("limit") || "20");
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const published = searchParams.get("published");

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};
        if (category) query.category = category;
        if (published !== null && published !== "") {
            query.isPublished = published === "true";
        }
        if (search) {
            query.$or = [
                { question: { $regex: search, $options: "i" } },
                { answer: { $regex: search, $options: "i" } },
            ];
        }

        const [faqs, total, stats] = await Promise.all([
            FAQ.find(query)
                .sort({ category: 1, order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            FAQ.countDocuments(query),
            FAQ.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        published: { $sum: { $cond: ["$isPublished", 1, 0] } },
                        draft: { $sum: { $cond: ["$isPublished", 0, 1] } },
                        categories: { $addToSet: "$category" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total: 1,
                        published: 1,
                        draft: 1,
                        categories: { $size: "$categories" }
                    }
                }
            ])
        ]);

        return NextResponse.json({
            success: true,
            data: faqs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            stats: stats[0] || { total: 0, published: 0, draft: 0, categories: 0 }
        });
    } catch (error: any) {
        console.error("Error fetching FAQs:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch FAQs" },
            { status: 500 }
        );
    }
}

// POST /api/admin/faqs - Create new FAQ
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
        const { question, answer, category, order, isPublished, coverImage } = body;

        if (!question || !answer) {
            return NextResponse.json(
                { success: false, message: "Question and answer are required" },
                { status: 400 }
            );
        }

        const faq = await FAQ.create({
            question,
            answer,
            category: category || "general",
            order: order || 0,
            isPublished: isPublished ?? true,
            coverImage,
        });

        return NextResponse.json(
            { success: true, data: faq, message: "FAQ created successfully" },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating FAQ:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to create FAQ" },
            { status: 500 }
        );
    }
}

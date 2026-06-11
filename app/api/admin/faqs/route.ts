import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";

// GET /api/admin/faqs - List all FAQs with pagination
async function getAdminFAQs(request: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const { limit, skip, page } = validatePagination(request);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const published = searchParams.get("published");

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
            categories: { $addToSet: "$category" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            published: 1,
            draft: 1,
            categories: { $size: "$categories" },
          },
        },
      ]),
    ]);

    return createAPIResponse(
      {
        items: faqs,
        stats: stats[0] || { total: 0, published: 0, draft: 0, categories: 0 },
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
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error,
      operation: "adminGetFAQs",
    });
  }
}

// POST /api/admin/faqs - Create new FAQ
async function createFAQ(request: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    await connectToDatabase();

    const body = await request.json();
    const { question, answer, category, order, isPublished, coverImage } = body;

    if (!question || !answer) {
      return createErrorResponse("Question and answer are required", 400, {
        req: request,
      });
    }

    const faq = await FAQ.create({
      question,
      answer,
      category: category || "general",
      order: order || 0,
      isPublished: isPublished ?? true,
      coverImage,
    });

    return createAPIResponse(faq, { message: "FAQ created successfully" }); // Note: Custom status 201 handled internally usually
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: request,
      error,
      operation: "adminCreateFAQ",
    });
  }
}

export const GET = withAPIMiddleware(getAdminFAQs);
export const POST = withAPIMiddleware(createFAQ);

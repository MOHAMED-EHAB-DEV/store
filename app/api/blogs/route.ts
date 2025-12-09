import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import { createAPIResponse, createErrorResponse, validatePagination } from "@/lib/utils/api-helpers";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Parse query params for pagination and filtering
    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = validatePagination(req);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const isAdmin = searchParams.get("admin") === "true";

    const query: any = {};

    if (!isAdmin) query.isPublished = true;

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const [posts, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar')
        .lean(),
      Blog.countDocuments(query)
    ]);

    return createAPIResponse(posts, {
      message: "Blog posts fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return createErrorResponse(error.message || "Internal Server Error", 500, process.env.NODE_ENV === 'development' ? error : undefined);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const user = await authenticateUser(false, true);
    if (!user) return createErrorResponse("Unauthorized", 401);

    const dbUser = await User.findById(user._id);
    if (dbUser?.role !== 'admin') {
      return createErrorResponse("Forbidden: Admin access only", 403);
    }

    // Auto-generate slug if missing
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Add author
    body.author = user._id;

    const newBlog = await Blog.create(body);
    return createAPIResponse(newBlog, { message: "Blog post created successfully" }); // 201 not directly supported by helper, but 200 is fine for success

  } catch (error: any) {
    console.error("API Error:", error);
    return createErrorResponse(error.message || "Internal Server Error", 500, process.env.NODE_ENV === 'development' ? error : undefined);
  }
}
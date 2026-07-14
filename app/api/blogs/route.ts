import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/lib/auth";
import { createAPIResponse, createErrorResponse, validatePagination, withAPIMiddleware } from "@/lib/utils/api-helpers";
import User from "@/lib/models/User";

async function getBlogs(req: NextRequest) {
  try {
    await connectToDatabase();

    // Parse query params for pagination and filtering
    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = validatePagination(req);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const isAdmin = searchParams.get("admin") === "true";

    const query: any = {};

    if (isAdmin) {
      const user = await authenticateUser(false, true);
      if (user) {
        const dbUser = await User.findById(user._id).select('role').lean();
        if (dbUser?.role !== 'admin') {
          query.isPublished = true;
        }
      } else {
        query.isPublished = true;
      }
    } else {
      query.isPublished = true;
    }

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
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "getBlogs" });
  }
}

export const GET = withAPIMiddleware(getBlogs, {
  cache: { ttl: 120 * 1000 },
});
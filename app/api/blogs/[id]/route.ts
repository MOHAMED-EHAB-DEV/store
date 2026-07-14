import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { authenticateUser } from "@/lib/auth";

async function getBlogPost(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const countViews = searchParams.get("countViews") === "true";
    await connectToDatabase();

    // Try finding by ID first, then slug
    let post = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Blog.findById(id).populate("author", "name avatar").lean();
    }

    if (!post) {
      post = await Blog.findOne({ slug: id })
        .populate("author", "name avatar")
        .lean();
    }

    if (!post) {
      return createErrorResponse("Blog post not found", 404, { req });
    }

    // Increment views if public
    if (
      typeof post.views === "number" &&
      countViews &&
      process.env.NODE_ENV === "production"
    ) {
      const user = await authenticateUser();
      if (user?.role !== "admin") {
        // Fire and forget update
        Blog.updateOne({ _id: post._id }, { $inc: { views: 1 } }).exec();
      }
    }

    return createAPIResponse(post);
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "getBlogPost",
    });
  }
}

export const GET = withAPIMiddleware(getBlogPost);

import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { authenticateUser } from "@/lib/auth";
import { type ObjectId } from "mongoose";

async function toggleLove(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action = "love" } = body; // "love" or "unlove"
    
    if (!["love", "unlove"].includes(action)) {
      return createErrorResponse("Invalid action", 400, { req });
    }

    await connectToDatabase();
    const user = await authenticateUser();

    // Try finding by ID first, then slug
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const blog = await Blog.findOne(query);

    if (!blog) {
      return createErrorResponse("Blog post not found", 404, { req });
    }

    let lovesIncrement = action === "love" ? 1 : -1;

    if (user) {
      const userIdStr = user._id.toString();
      const hasLoved = blog.lovedBy?.some((uid: any) => uid.toString() === userIdStr);

      if (action === "love" && !hasLoved) {
        blog.lovedBy.push(user._id as unknown as ObjectId);
        blog.loves = (blog.loves || 0) + 1;
        await blog.save();
      } else if (action === "unlove" && hasLoved) {
        blog.lovedBy = blog.lovedBy.filter(
          (uid: any) => uid.toString() !== userIdStr
        );
        blog.loves = Math.max(0, (blog.loves || 0) - 1);
        await blog.save();
      }
    } else {
      // Anonymous
      blog.loves = Math.max(0, (blog.loves || 0) + lovesIncrement);
      await blog.save();
    }

    return createAPIResponse({ loves: blog.loves, lovedBy: blog.lovedBy });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "toggleLove",
    });
  }
}

export const POST = withAPIMiddleware(toggleLove);

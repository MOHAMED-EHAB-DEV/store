import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { authenticateUser } from "@/lib/auth";
import { ObjectId } from "mongoose";

async function syncLoves(req: NextRequest) {
  try {
    const user = await authenticateUser();
    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const body = await req.json().catch(() => ({}));
    const { blogIds = [] } = body;

    if (!Array.isArray(blogIds) || blogIds.length === 0) {
      return createAPIResponse({ syncedCount: 0 });
    }

    await connectToDatabase();
    const userIdStr = user._id.toString();

    const validIds = blogIds.filter(
      (id): id is string => typeof id === "string" && !!id.trim(),
    );

    if (validIds.length === 0) {
      return createAPIResponse({ syncedCount: 0 });
    }

    const idQueries = validIds.map((id) =>
      id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id },
    );

    const blogs = await Blog.find({ $or: idQueries });
    let syncedCount = 0;

    for (const blog of blogs) {
      const hasLoved = blog.lovedBy?.some(
        (uid: any) => uid.toString() === userIdStr,
      );

      if (!hasLoved) {
        if (!Array.isArray(blog.lovedBy)) blog.lovedBy = [];
        blog.lovedBy.push(user?._id as unknown as ObjectId);
        await blog.save();
        syncedCount++;
      }
    }

    return createAPIResponse({ syncedCount });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Failed to sync loves", 500, {
      req,
      error,
      operation: "syncLoves",
    });
  }
}

export const POST = withAPIMiddleware(syncLoves);

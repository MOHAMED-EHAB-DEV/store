import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";

async function bulkUpdateBlogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { blogIds, updates } = body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return createErrorResponse("Blog IDs array is required", 400, { req });
    }

    if (!updates || typeof updates !== "object") {
      return createErrorResponse("Updates object is required", 400, { req });
    }

    const blogsToUpdate = await Blog.find({ _id: { $in: blogIds } }).select("slug _id");

    const result = await Blog.updateMany(
      {
        _id: { $in: blogIds },
      },
      { $set: updates },
    );

    await revalidate("/blog");
    for (const blog of blogsToUpdate) {
      if (blog.slug) await revalidateWithTag(`blog-${blog.slug}`);
      await revalidateWithTag(`blog-${blog._id}`);
    }

    return createAPIResponse(
      { modifiedCount: result.modifiedCount },
      { message: `${result.modifiedCount} blogs updated successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkUpdateBlogs" });
  }
}

export const POST = withAPIMiddleware(bulkUpdateBlogs);

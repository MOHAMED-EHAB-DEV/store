import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkDeleteBlogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { blogIds } = body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return createErrorResponse("Blog IDs array is required", 400, { req });
    }

    const result = await Blog.deleteMany({
      _id: { $in: blogIds },
    });

    return createAPIResponse(
      { deletedCount: result.deletedCount },
      { message: `${result.deletedCount} blogs deleted successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkDeleteBlogs" });
  }
}

export const POST = withAPIMiddleware(bulkDeleteBlogs);

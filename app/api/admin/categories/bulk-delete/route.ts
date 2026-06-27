import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkDeleteCategories(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { categoryIds } = body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return createErrorResponse("Category IDs array is required", 400, { req });
    }

    const result = await Category.deleteMany({
      _id: { $in: categoryIds },
    });

    return createAPIResponse(
      { deletedCount: result.deletedCount },
      { message: `${result.deletedCount} categories deleted successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkDeleteCategories" });
  }
}

export const POST = withAPIMiddleware(bulkDeleteCategories);

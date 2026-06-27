import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkDeleteFAQs(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { faqIds } = body;

    if (!faqIds || !Array.isArray(faqIds) || faqIds.length === 0) {
      return createErrorResponse("FAQ IDs array is required", 400, { req });
    }

    const result = await FAQ.deleteMany({
      _id: { $in: faqIds },
    });

    return createAPIResponse(
      { deletedCount: result.deletedCount },
      { message: `${result.deletedCount} FAQs deleted successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkDeleteFAQs" });
  }
}

export const POST = withAPIMiddleware(bulkDeleteFAQs);

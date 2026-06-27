import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkUpdateFAQs(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { faqIds, updates } = body;

    if (!faqIds || !Array.isArray(faqIds) || faqIds.length === 0) {
      return createErrorResponse("FAQ IDs array is required", 400, { req });
    }

    if (!updates || typeof updates !== "object") {
      return createErrorResponse("Updates object is required", 400, { req });
    }

    const result = await FAQ.updateMany(
      {
        _id: { $in: faqIds },
      },
      { $set: updates },
    );

    return createAPIResponse(
      { modifiedCount: result.modifiedCount },
      { message: `${result.modifiedCount} FAQs updated successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkUpdateFAQs" });
  }
}

export const POST = withAPIMiddleware(bulkUpdateFAQs);

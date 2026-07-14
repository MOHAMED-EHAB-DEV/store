import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkUpdateTemplates(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { templateIds, updates } = body;

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return createErrorResponse("Template IDs array is required", 400, { req });
    }

    if (!updates || typeof updates !== "object") {
      return createErrorResponse("Updates object is required", 400, { req });
    }

    const result = await Template.updateMany(
      {
        _id: { $in: templateIds },
      },
      { $set: updates },
    );

    return createAPIResponse(
      { modifiedCount: result.modifiedCount },
      { message: `${result.modifiedCount} templates updated successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkUpdateTemplates" });
  }
}

export const POST = withAPIMiddleware(bulkUpdateTemplates);

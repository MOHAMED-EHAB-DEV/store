import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { authenticateUser } from "@/lib/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function batchUpdateErrorLogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();
    const body = await req.json();
    const { ids, resolved } = body;

    if (!Array.isArray(ids) || ids.length === 0 || typeof resolved !== "boolean") {
      return createErrorResponse("Invalid payload parameters", 400, { req });
    }

    const updateData: any = {
      resolved,
      resolvedAt: resolved ? new Date() : null,
    };

    const result = await ErrorLog.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    return createAPIResponse(
      { modifiedCount: result.modifiedCount },
      {
        message: resolved
          ? `${result.modifiedCount} errors marked as resolved`
          : `${result.modifiedCount} errors reopened`,
      }
    );
  } catch (error: any) {
    return createErrorResponse("Failed to update error logs batch", 500, {
      req,
      error,
      operation: "adminBatchUpdateErrorLogs",
    });
  }
}

export const PATCH = withAPIMiddleware(batchUpdateErrorLogs);

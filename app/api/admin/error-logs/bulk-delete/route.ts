import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkDeleteErrorLogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { logIds } = body;

    if (!logIds || !Array.isArray(logIds) || logIds.length === 0) {
      return createErrorResponse("Log IDs array is required", 400, { req });
    }

    const result = await ErrorLog.deleteMany({
      _id: { $in: logIds },
    });

    return createAPIResponse(
      { deletedCount: result.deletedCount },
      { message: `${result.deletedCount} logs deleted successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkDeleteErrorLogs" });
  }
}

export const POST = withAPIMiddleware(bulkDeleteErrorLogs);

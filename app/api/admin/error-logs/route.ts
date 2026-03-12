import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { authenticateUser } from "@/middleware/auth";
import { createAPIResponse, createErrorResponse, handleApiError, validatePagination, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getErrorLogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const { limit, skip, page } = validatePagination(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const search = searchParams.get("search");

    const query: any = {};
    if (status) query.status = parseInt(status);
    if (method) query.method = method;
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { route: { $regex: search, $options: "i" } },
        { operation: { $regex: search, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      ErrorLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email avatar")
        .lean(),
      ErrorLog.countDocuments(query),
    ]);

    return createAPIResponse(logs, {
      message: "Error logs fetched successfully",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return handleApiError(error, req, { operation: "adminGetErrorLogs" });
  }
}

async function deleteErrorLogs(req: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get("days") || "0");

        if (days > 0) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            await ErrorLog.deleteMany({ timestamp: { $lt: cutoffDate } });
            return createAPIResponse(null, { message: `Logs older than ${days} days deleted successfully` });
        }

        return createErrorResponse("Invalid parameters", 400, { req });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "adminDeleteErrorLogs" });
    }
}

export const GET = withAPIMiddleware(getErrorLogs);
export const DELETE = withAPIMiddleware(deleteErrorLogs);


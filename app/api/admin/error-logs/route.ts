import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { authenticateUser } from "@/middleware/auth";
import { createAPIResponse, handleApiError, validatePagination } from "@/lib/utils/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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
  } catch (error) {
    return handleApiError(error, req, { operation: "adminGetErrorLogs" });
  }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
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

        return NextResponse.json({ success: false, message: "Invalid parameters" }, { status: 400 });
    } catch (error) {
        return handleApiError(error, req, { operation: "adminDeleteErrorLogs" });
    }
}

import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import DownloadLog from "@/lib/models/DownloadLog";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";

// GET /api/admin/download-logs - List download logs with filters
async function getDownloadLogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = validatePagination(req);
    const templateId = searchParams.get("templateId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query
    const query: any = {};
    if (templateId) query.templateId = templateId;
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const [logs, total, stats] = await Promise.all([
      DownloadLog.find(query)
        .populate("templateId", "title thumbnail")
        .populate("userId", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DownloadLog.countDocuments(query),
      DownloadLog.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            templates: { $addToSet: "$templateId" },
            users: { $addToSet: "$userId" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            uniqueTemplates: { $size: "$templates" },
            uniqueUsers: { $size: "$users" },
          },
        },
      ]),
    ]);

    return createAPIResponse(
      {
        logs,
        stats: stats[0] || { total: 0, uniqueTemplates: 0, uniqueUsers: 0 },
      },
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req,
      error,
      operation: "adminGetDownloadLogs",
    });
  }
}

export const GET = withAPIMiddleware(getDownloadLogs);

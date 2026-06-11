import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { authenticateUser } from "@/middleware/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getAnalyticsStats(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all aggregations in parallel for performance
    const [
      totalVisitors,
      uniqueLast24h,
      uniqueLast7d,
      uniqueLast30d,
      topPages,
      dailyVisits,
    ] = await Promise.all([
      // Total unique visitors ever
      Visitor.countDocuments(),

      // Unique visitors in last 24h (active)
      Visitor.countDocuments({ lastVisit: { $gte: last24h } }),

      // Unique visitors in last 7 days
      Visitor.countDocuments({ lastVisit: { $gte: last7d } }),

      // Unique visitors in last 30 days
      Visitor.countDocuments({ lastVisit: { $gte: last30d } }),

      // Top 10 most visited pages
      Visitor.aggregate([
        { $unwind: "$pathHistory" },
        { $group: { _id: "$pathHistory.path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { path: "$_id", count: 1, _id: 0 } },
      ]),

      // Daily unique visitors for last 30 days (for charts)
      Visitor.aggregate([
        { $match: { lastVisit: { $gte: last30d } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    return createAPIResponse({
      totalVisitors,
      uniqueLast24h,
      uniqueLast7d,
      uniqueLast30d,
      topPages,
      dailyVisits,
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "getAnalyticsStats" });
  }
}

export const GET = withAPIMiddleware(getAnalyticsStats);

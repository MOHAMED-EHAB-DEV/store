import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import User from "@/lib/models/User";
import Template from "@/lib/models/Template";
import DownloadLog from "@/lib/models/DownloadLog";
import Ticket from "@/lib/models/Ticket";
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

    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Run all aggregations in parallel for performance
    const [
      totalVisitors,
      uniqueLast24h,
      uniqueLast7d,
      uniqueLast30d,
      topPages,
      dailyVisits,
      totalUsers,
      newUsersThisMonth,
      totalTemplates,
      newTemplatesThisMonth,
      totalDownloads,
      downloadsThisMonth,
      activeTickets,
      totalTickets,
      userGrowthRaw,
      downloadsRaw
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

      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      
      Template.countDocuments(),
      Template.countDocuments({ createdAt: { $gte: lastMonth } }),
      
      DownloadLog.countDocuments(),
      DownloadLog.countDocuments({ createdAt: { $gte: lastMonth } }),
      
      Ticket.countDocuments({ status: { $nin: ["resolved", "closed"] } }),
      Ticket.countDocuments(),

      // User growth over 6 months
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),

      // Downloads over 30 days
      DownloadLog.aggregate([
        { $match: { createdAt: { $gte: last30d } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const userGrowth = totalUsers > 0 ? (newUsersThisMonth / totalUsers) * 100 : 0;
    const templateGrowth = totalTemplates > 0 ? (newTemplatesThisMonth / totalTemplates) * 100 : 0;

    // Format 6 months user growth
    const userGrowthData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = userGrowthRaw.find((x: any) => x._id.year === year && x._id.month === month);
      return {
        date: new Date(year, month - 1, 15),
        value: found ? found.count : 0,
      };
    });

    // Format 30 days downloads
    const downloadsData = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split("T")[0];
      const found = downloadsRaw.find((x: any) => x._id === dateStr);
      return {
        date: d,
        value: found ? found.count : 0,
      };
    });

    return createAPIResponse({
      totalVisitors,
      uniqueLast24h,
      uniqueLast7d,
      uniqueLast30d,
      topPages,
      dailyVisits,
      adminStats: {
        stats: {
          totalUsers, newUsersThisMonth, userGrowth,
          totalTemplates, newTemplatesThisMonth, templateGrowth,
          totalDownloads, downloadsThisMonth,
          activeTickets, totalTickets
        },
        userGrowthData,
        downloadsData
      }
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "getAnalyticsStats" });
  }
}

export const GET = withAPIMiddleware(getAnalyticsStats);

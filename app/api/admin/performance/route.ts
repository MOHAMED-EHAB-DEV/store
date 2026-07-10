import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics from "@/lib/models/Analytics";
import { authenticateUser } from "@/middleware/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getPerformanceStats(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run aggregations in parallel
    const [
      globalAverages,
      ratingDistributions,
      dailyTrends,
      slowestPages,
      recentSessionsData,
      totalSessionsCount
    ] = await Promise.all([
      // 1. Global average for each metric
      Analytics.aggregate([
        { $match: { createdAt: { $gte: last30d } } },
        { $unwind: "$pages" },
        { $unwind: "$pages.metrics" },
        {
          $group: {
            _id: "$pages.metrics.name",
            average: { $avg: "$pages.metrics.value" },
            count: { $sum: 1 }
          }
        }
      ]),

      // 2. Rating distributions (good vs poor)
      Analytics.aggregate([
        { $match: { createdAt: { $gte: last30d } } },
        { $unwind: "$pages" },
        { $unwind: "$pages.metrics" },
        {
          $group: {
            _id: {
              name: "$pages.metrics.name",
              rating: "$pages.metrics.rating"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.name",
            ratings: {
              $push: {
                rating: "$_id.rating",
                count: "$count"
              }
            },
            total: { $sum: "$count" }
          }
        }
      ]),

      // 3. Daily trends (for charts)
      Analytics.aggregate([
        { $match: { createdAt: { $gte: last30d } } },
        { $unwind: "$pages" },
        { $unwind: "$pages.metrics" },
        {
          $group: {
            _id: {
              date: "$date",
              name: "$pages.metrics.name"
            },
            average: { $avg: "$pages.metrics.value" }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]),

      // 4. Slowest pages (Top 10 paths by highest LCP)
      Analytics.aggregate([
        { $match: { createdAt: { $gte: last30d } } },
        { $unwind: "$pages" },
        { $unwind: "$pages.metrics" },
        { $match: { "pages.metrics.name": "LCP" } },
        {
          $group: {
            _id: "$pages.path",
            averageLCP: { $avg: "$pages.metrics.value" },
            count: { $sum: 1 }
          }
        },
        { $match: { count: { $gte: 2 } } }, // only pages with at least 2 visits
        { $sort: { averageLCP: -1 } },
        { $limit: 10 }
      ]),

      // 5. Recent sessions
      Analytics.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // 6. Total sessions count
      Analytics.countDocuments({})
    ]);

    // Format the daily trends into a more consumable format for the frontend chart
    const formattedTrends: Record<string, { date: string; value: number }[]> = {};
    
    dailyTrends.forEach((t) => {
      if (!formattedTrends[t._id.name]) {
        formattedTrends[t._id.name] = [];
      }
      formattedTrends[t._id.name].push({
        date: t._id.date,
        value: Number(t.average.toFixed(2))
      });
    });

    return createAPIResponse({
      globalAverages,
      ratingDistributions,
      dailyTrends: formattedTrends,
      slowestPages,
      recentSessions: recentSessionsData,
      totalPages: Math.ceil(totalSessionsCount / limit),
      currentPage: page,
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req, error, operation: "getPerformanceStats" });
  }
}

export const GET = withAPIMiddleware(getPerformanceStats);

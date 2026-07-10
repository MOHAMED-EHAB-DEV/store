import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { createAPIResponse, createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getAnalytics(req: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalVisitors, uniqueLast24h, uniqueLast7d, uniqueLast30d, topPages, dailyVisits, recentVisitorsData, totalVisitorsCount] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ lastVisit: { $gte: last24h } }),
      Visitor.countDocuments({ lastVisit: { $gte: last7d } }),
      Visitor.countDocuments({ lastVisit: { $gte: last30d } }),
      Visitor.aggregate([
        { $unwind: "$pathHistory" },
        { $group: { _id: "$pathHistory.path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { path: "$_id", count: 1, _id: 0 } }
      ]),
      Visitor.aggregate([
        { $match: { lastVisit: { $gte: last30d } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } }
      ]),
      Visitor.find({})
        .sort({ lastVisit: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email avatar")
        .lean()
        .exec(),
      Visitor.countDocuments({})
    ]);

    const recentVisitors = recentVisitorsData.map((v) => ({
      _id: v._id.toString(),
      visitorId: v.visitorId,
      firstVisit: v.firstVisit.toISOString(),
      lastVisit: v.lastVisit.toISOString(),
      userAgent: v.userAgent,
      visitCount: v.visitCount,
      user: v.userId || null,
    }));

    return createAPIResponse({
        stats: {
          totalVisitors,
          uniqueLast24h,
          uniqueLast7d,
          uniqueLast30d,
          topPages,
          dailyVisits,
        },
        recentVisitors,
        totalPages: Math.ceil(totalVisitorsCount / limit),
        currentPage: page,
      });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return createErrorResponse("Failed to fetch admin analytics", 500, {
      error,
      req
    });
  }
}

export const GET = withAPIMiddleware(getAnalytics);
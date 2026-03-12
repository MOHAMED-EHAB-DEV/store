import { Metadata } from "next";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Admin Dashboard | Visitor Analytics",
  description: "Comprehensive admin dashboard for visitor analytics",
  robots: "noindex, nofollow",
};

interface AnalyticsStatsData {
  totalVisitors: number;
  uniqueLast24h: number;
  uniqueLast7d: number;
  uniqueLast30d: number;
  topPages: { path: string; count: number }[];
  dailyVisits: { date: string; count: number }[];
}

async function getAnalyticsData() {
  try {
    await connectToDatabase();
    await connection();

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVisitors,
      uniqueLast24h,
      uniqueLast7d,
      uniqueLast30d,
      topPages,
      dailyVisits,
      recentVisitorsData,
    ] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ lastVisit: { $gte: last24h } }),
      Visitor.countDocuments({ lastVisit: { $gte: last7d } }),
      Visitor.countDocuments({ lastVisit: { $gte: last30d } }),
      Visitor.aggregate([
        { $unwind: "$pathHistory" },
        { $group: { _id: "$pathHistory.path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { path: "$_id", count: 1, _id: 0 } },
      ]),
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
      Visitor.find({})
        .sort({ lastVisit: -1 })
        .limit(10)
        .lean()
        .exec(),
    ]);

    const stats: AnalyticsStatsData = {
      totalVisitors,
      uniqueLast24h,
      uniqueLast7d,
      uniqueLast30d,
      topPages,
      dailyVisits,
    };

    const recentVisitors = recentVisitorsData.map((v) => ({
      _id: v._id.toString(),
      visitorId: v.visitorId,
      firstVisit: v.firstVisit.toISOString(),
      lastVisit: v.lastVisit.toISOString(),
      userAgent: v.userAgent,
      visitCount: v.visitCount,
    }));

    return {
      stats,
      recentVisitors,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error("Error fetching analytics data:", error);
    return {
      stats: null,
      recentVisitors: [],
    };
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return <AdminAnalyticsClient data={data} />;
}

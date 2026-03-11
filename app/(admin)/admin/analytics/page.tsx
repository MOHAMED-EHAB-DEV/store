import { Metadata } from "next";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";

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
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";
    
    // Fetch stats from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/stats`, {
      headers: {
        cookie: cookieHeader,
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    const statsJSON = response.ok ? await response.json() : { data: null };
    const stats = (statsJSON.success ? statsJSON.data : null) as AnalyticsStatsData | null;

    // Fetch recent visitors directly from DB
    await connectToDatabase();
    const recentVisitorsData = await Visitor.find({})
      .sort({ lastVisit: -1 })
      .limit(10)
      .lean()
      .exec();

    const recentVisitors = recentVisitorsData.map(v => ({
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

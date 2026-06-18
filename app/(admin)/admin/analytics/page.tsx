import { Metadata } from "next";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";
// import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Admin Dashboard | Visitor Analytics",
  description: "Comprehensive admin dashboard for visitor analytics",
  robots: "noindex, nofollow",
};

async function getAnalyticsData() {
  try {
    // const cookieStore = await cookies();
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/analytics`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Analytics fetch failed:", res.status, await res.text());
      return { stats: null, recentVisitors: [] };
    }

    const data = await res.json();
    return data.data;
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

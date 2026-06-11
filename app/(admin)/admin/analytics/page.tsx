import { Metadata } from "next";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Visitor Analytics",
  description: "Comprehensive admin dashboard for visitor analytics",
  robots: "noindex, nofollow",
};

async function getAnalyticsData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics`);
    const data = await res.json();
    return data.data;
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

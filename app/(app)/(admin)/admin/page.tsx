import { Metadata } from "next";
import { headers } from "next/headers";
import AdminDashboardHome from "@/components/Admin/AdminDashboardHome";

export const metadata: Metadata = {
  title: "Admin Dashboard | Analytics",
  description: "Comprehensive admin dashboard with analytics and insights",
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

async function getAdminDashboardData() {
  try {
    const cookie = (await headers()).get("cookie") || "";

    const fetchAndParse = async (url: string) => {
      const res = await fetch(url, { headers: { cookie } });
      return res.ok ? res.json() : { data: Array.isArray(res) ? [] : null };
    };

    const [users, templates, downloads, tickets, analytics] =
      await Promise.all([
        fetchAndParse(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users?limit=1000`),
        fetchAndParse(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/templates?limit=1000`),
        fetchAndParse(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/download-logs?limit=1000`),
        fetchAndParse(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/tickets?limit=1000`),
        fetchAndParse(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/stats`)
      ]);

    return {
      users: users.data?.items || [],
      templates: templates.data?.items || [],
      downloads: downloads.data?.logs || [],
      tickets: tickets.data?.items || [],
      analytics: (analytics.success
        ? analytics.data
        : null) as AnalyticsStatsData | null,
    };
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Error fetching admin dashboard data:", error);
    return {
      users: [],
      templates: [],
      downloads: [],
      tickets: [],
      analytics: null,
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return <AdminDashboardHome data={data} />;
}

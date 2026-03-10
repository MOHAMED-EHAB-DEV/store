import { Metadata } from "next";
import AdminDashboardHome from "@/components/Admin/AdminDashboardHome";
import { headers } from "next/headers";

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
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";
    const [usersRes, templatesRes, downloadsRes, ticketsRes, analyticsRes] =
      await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users?limit=1000`, {
          headers: {
            cookie: cookieHeader,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/templates?limit=1000`, {
          headers: {
            cookie: cookieHeader,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/download-logs?limit=1000`, {
          headers: {
            cookie: cookieHeader,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/tickets?limit=1000`, {
          headers: {
            cookie: cookieHeader,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analytics/stats`, {
          headers: {
            cookie: cookieHeader,
          },
        }),
      ]);

    const users = usersRes.ok ? await usersRes.json() : { data: [] };
    const templates = templatesRes.ok
      ? await templatesRes.json()
      : { data: [] };
    const downloads = downloadsRes.ok
      ? await downloadsRes.json()
      : { data: [] };
    const tickets = ticketsRes.ok ? await ticketsRes.json() : { data: [] };
    const analytics = analyticsRes.ok
      ? await analyticsRes.json()
      : { data: null };

    return {
      users: users.data || [],
      templates: templates.data || [],
      downloads: downloads.data || [],
      tickets: tickets.data || [],
      analytics: (analytics.success
        ? analytics.data
        : null) as AnalyticsStatsData | null,
    };
  } catch (error) {
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

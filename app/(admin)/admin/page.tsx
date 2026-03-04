import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardHome from "@/components/Admin/AdminDashboardHome";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | Analytics",
  description: "Comprehensive admin dashboard with analytics and insights",
  robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

interface AnalyticsStatsData {
  totalVisitors: number;
  uniqueLast24h: number;
  uniqueLast7d: number;
  uniqueLast30d: number;
  topPages: { path: string; count: number }[];
  dailyVisits: { date: string; count: number }[];
}

async function getAdminDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const headers = { Cookie: `token=${token}` };

  try {
    const [usersRes, templatesRes, downloadsRes, ticketsRes, analyticsRes] =
      await Promise.all([
        fetch(`${baseUrl}/api/admin/users?limit=1000`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/admin/templates?limit=1000`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/admin/download-logs?limit=1000`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/admin/tickets?limit=1000`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${baseUrl}/api/analytics/stats`, { headers, cache: "no-store" }),
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
  const user = await authenticateUser(true, true, true);
  if (!user) redirect("/");

  const data = await getAdminDashboardData();

  return <AdminDashboardHome data={data} />;
}

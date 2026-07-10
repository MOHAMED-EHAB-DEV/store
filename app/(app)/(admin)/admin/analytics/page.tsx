import { Metadata } from "next";
import { headers } from "next/headers";
import AdminAnalyticsClient from "@/components/Admin/AdminAnalyticsClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Visitor Analytics",
  description: "Comprehensive admin dashboard for visitor analytics",
  robots: "noindex, nofollow",
};

async function getAnalyticsData(page: number) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/analytics?page=${page}`, {
      cache: "no-store",
      headers: { cookie: (await headers()).get("cookie") || "" },
    });

    if (!res.ok) {
      console.error("Analytics fetch failed:", res.status, await res.text());
      return { stats: null, recentVisitors: [], totalPages: 1, currentPage: 1 };
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      stats: null,
      recentVisitors: [],
      totalPages: 1,
      currentPage: 1
    };
  }
}

export default async function AnalyticsPage(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page as string || "1", 10);
  const data = await getAnalyticsData(page);

  return <AdminAnalyticsClient data={data} />;
}


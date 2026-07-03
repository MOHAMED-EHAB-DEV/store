import { Metadata } from "next";
import { headers } from "next/headers";
import PerformanceClient from "@/components/Admin/PerformanceClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Performance",
  description: "Web Vitals and Core Performance Analytics",
  robots: "noindex, nofollow",
};

async function getPerformanceData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/performance`, {
      cache: "no-store",
      headers: { cookie: (await headers()).get("cookie") || "" },
    });

    if (!res.ok) {
      console.error("Performance fetch failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return null;
  }
}

export default async function PerformancePage() {
  const data = await getPerformanceData();

  return <PerformanceClient data={data} />;
}

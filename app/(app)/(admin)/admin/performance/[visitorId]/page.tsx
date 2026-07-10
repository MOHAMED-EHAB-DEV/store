import { Metadata } from "next";
import { headers } from "next/headers";
import PerformanceDetailClient from "@/components/Admin/PerformanceDetailClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Performance Details",
  description: "Visitor performance details and metrics",
  robots: "noindex, nofollow",
};

async function getVisitorPerformance(visitorId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/admin/performance/${visitorId}`, {
      cache: "no-store",
      headers: { cookie: (await headers()).get("cookie") || "" },
    });

    if (!res.ok) {
      console.error("Performance detail fetch failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching performance details:", error);
    return null;
  }
}

export default async function PerformanceDetailPage(props: {
  params: Promise<{ visitorId: string }>;
}) {
  const { visitorId } = await props.params;
  const data = await getVisitorPerformance(visitorId);

  return <PerformanceDetailClient data={data} visitorId={visitorId} />;
}

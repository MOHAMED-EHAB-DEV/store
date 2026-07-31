import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import APIMetricsDetailClient from "@/components/Admin/APIMetricsDetailClient";
import { getBaseUrl } from "@/lib/utils/server";

export const metadata: Metadata = {
  title: "Admin Dashboard | Route Performance Detail",
  description: "Detailed latency, status codes, and request traces for API route",
  robots: "noindex, nofollow",
};

async function getAPIMetricDetailData(route: string, method: string) {
  try {
    const baseUrl = await getBaseUrl();
    const cookie = (await headers()).get("cookie") || "";

    const res = await fetch(
      `${baseUrl}/api/admin/api-metrics/detail?route=${encodeURIComponent(route)}&method=${encodeURIComponent(method)}`,
      {
        cache: "no-store",
        headers: { cookie },
      }
    );

    if (!res.ok) {
      console.error("API metric detail fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching API metric detail data:", error);
    return null;
  }
}

export default async function APIMetricsDetailPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const route = (searchParams.route as string) || "";
  const method = (searchParams.method as string) || "GET";

  const data = route ? await getAPIMetricDetailData(route, method) : null;

  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-400 animate-pulse">
          Loading route performance details...
        </div>
      }
    >
      <APIMetricsDetailClient data={data} routeParam={route} />
    </Suspense>
  );
}

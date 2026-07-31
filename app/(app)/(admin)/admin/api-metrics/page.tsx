import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import APIMetricsClient from "@/components/Admin/APIMetricsClient";
import { getBaseUrl } from "@/lib/utils/server";

export const metadata: Metadata = {
  title: "Admin Dashboard | API Performance Metrics",
  description: "API Route Response Times, Latency & Error Analytics",
  robots: "noindex, nofollow",
};

async function getAPIMetricsData(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const baseUrl = await getBaseUrl();
    const cookie = (await headers()).get("cookie") || "";

    const params = new URLSearchParams();
    if (searchParams.search) params.set("search", String(searchParams.search));
    if (searchParams.method) params.set("method", String(searchParams.method));
    if (searchParams.sortBy) params.set("sortBy", String(searchParams.sortBy));
    if (searchParams.page) params.set("page", String(searchParams.page));

    const res = await fetch(`${baseUrl}/api/admin/api-metrics?${params.toString()}`, {
      cache: "no-store",
      headers: { cookie },
    });

    if (!res.ok) {
      console.error("API metrics fetch failed:", res.status);
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching API metrics data:", error);
    return null;
  }
}

export default async function APIMetricsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const data = await getAPIMetricsData(searchParams);

  return (
    <Suspense
      fallback={
        <div className="p-6 text-center text-gray-400 animate-pulse">
          Loading API metrics...
        </div>
      }
    >
      <APIMetricsClient data={data} />
    </Suspense>
  );
}

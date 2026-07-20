import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import DownloadLogsClient from "@/components/Admin/DownloadLogsClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
  title: "Download Logs | Admin Dashboard",
  description:
    "View and analyze all template downloads with detailed analytics",
  robots: "noindex, nofollow",
};

async function getDownloadLogs(searchParams: {
  [key: string]: string | undefined;
}) {
  const params = new URLSearchParams();
  if (searchParams.page) params.set("page", searchParams.page);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.templateId)
    params.set("templateId", searchParams.templateId);
  if (searchParams.userId) params.set("userId", searchParams.userId);
  if (searchParams.status) params.set("status", searchParams.status);
  params.set("limit", "20");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/download-logs?${params.toString()}`,
      { headers: { cookie: (await headers()).get("cookie") || "" } },
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Error fetching download logs:", error);
    return null;
  }
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function DownloadLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getDownloadLogs(params);

  if (!data) {
    return (
      <div className="p-6 text-center">
        <ErrorState message="Failed to load download logs. Please try again." />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Loading data...</div>}>
      <DownloadLogsClient
        initialData={data.data.logs}
        stats={data.data.stats}
        pagination={data.pagination}
        searchParams={params}
      />
    </Suspense>
  );
}

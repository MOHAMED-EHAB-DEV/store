import { Suspense } from "react";
import AdminErrorLogsClient from "@/components/Admin/AdminErrorLogsClient";
import { headers } from "next/headers";

async function getErrorLogs(searchParams: any) {
  const params = new URLSearchParams(searchParams);
  if (!params.has("limit")) {
    params.set("limit", "50");
  }
  const query = params.toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/error-logs?${query}`,
    { headers: { cookie: (await headers()).get("cookie") || "" } }
  );

  if (!res.ok) return { data: { logs: [], filterOptions: {} }, pagination: {} };
  return res.json();
}

export default async function AdminErrorLogsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const resolvedSearchParams = await searchParams;
  const { data, pagination } = await getErrorLogs(resolvedSearchParams);

  const logs = Array.isArray(data) ? data : data?.logs || [];
  const filterOptions = data?.filterOptions || {};

  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Loading data...</div>}>
      <AdminErrorLogsClient initialData={logs} filterOptions={filterOptions} pagination={pagination} />
    </Suspense>
  );
}

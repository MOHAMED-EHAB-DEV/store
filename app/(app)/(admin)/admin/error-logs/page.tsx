import { Suspense } from "react";
import AdminErrorLogsClient from "@/components/Admin/AdminErrorLogsClient";
import { headers } from "next/headers";

async function getErrorLogs(searchParams: any) {
  const query = new URLSearchParams(searchParams).toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/error-logs?${query}`,
    { headers: { cookie: (await headers()).get("cookie") || "" } }
  );

  if (!res.ok) return { data: [], pagination: {} };
  return res.json();
}

export default async function AdminErrorLogsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const { data, pagination } = await getErrorLogs(await searchParams);

  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Loading data...</div>}>
      <AdminErrorLogsClient initialData={data || []} pagination={pagination} />
    </Suspense>
  );
}

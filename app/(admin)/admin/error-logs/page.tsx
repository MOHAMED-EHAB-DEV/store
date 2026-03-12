import AdminErrorLogsClient from "@/components/Admin/AdminErrorLogsClient";

async function getErrorLogs(searchParams: any) {
  const query = new URLSearchParams(searchParams).toString();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/error-logs?${query}`,
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
    <AdminErrorLogsClient initialData={data || []} pagination={pagination} />
  );
}

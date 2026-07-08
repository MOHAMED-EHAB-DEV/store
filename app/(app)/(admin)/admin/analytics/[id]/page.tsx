import AdminVisitorDetailsClient from "@/components/Admin/AdminVisitorDetailsClient";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

async function getVisitorDetails(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/visitors/${id}`,
    { headers: { cookie: (await headers()).get("cookie") || "" } }
  );

  if (!res.ok) return null;
  const body = await res.json();
  return body.data;
}

export default async function AdminVisitorDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const data = await getVisitorDetails(id);

  if (!data || !data.visitor) {
    notFound();
  }

  return <AdminVisitorDetailsClient visitor={data.visitor} analytics={data.analytics} />;
}

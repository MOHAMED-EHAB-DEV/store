import AdminVisitorDetailsClient from "@/components/Admin/AdminVisitorDetailsClient";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getVisitorDetails(id: string) {
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    
    const res = await fetch(`${protocol}://${host}/api/admin/visitors/${id}`, {
        cache: "no-store",
        headers: await headers(),
    });

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
    const visitor = await getVisitorDetails(id);

    if (!visitor) {
        notFound();
    }

    return (
        <AdminVisitorDetailsClient visitor={visitor} />
    );
}

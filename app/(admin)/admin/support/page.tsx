import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSupportClient from "@/components/Admin/AdminSupportClient";
import { authenticateUser } from "@/middleware/auth";
import { ErrorState } from "@/components/Dashboard/shared/LoadingStates";

export const metadata: Metadata = {
    title: "Support Tickets | Admin Dashboard",
    description: "Manage all support tickets and customer inquiries",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getSupportTickets() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/admin/tickets?limit=1000`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        const data = response.ok ? await response.json() : { data: [] };
        return data.data || [];
    } catch (error) {
        console.error("Error fetching support tickets:", error);
        return null;
    }
}

export default async function AdminSupportPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const tickets = await getSupportTickets();

    if (tickets === null) {
        return <ErrorState message="Failed to load support tickets. Please refresh the page." />;
    }

    return <AdminSupportClient tickets={tickets} />;
}

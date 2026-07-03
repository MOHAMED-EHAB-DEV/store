import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SupportTicketsView from "@/components/Dashboard/SupportTicketsView";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Support Tickets | Dashboard",
    robots: {
        index: false,
        follow: false,
    },
};

async function getTickets(token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/support/tickets?limit=50`, {
            headers: {
                Cookie: `token=${token}`,
            },
            cache: "no-store",
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch tickets");
        }

        return data.data || [];
    } catch (error) {
        console.error("Error fetching support tickets on server:", error);
        return [];
    }
}

export default async function DashboardSupportPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    const tickets = await getTickets(token);

    return <SupportTicketsView initialTickets={tickets} />;
}

import { Metadata } from "next";
import { authenticateUser } from "@/middleware/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TicketDetailClient from "./TicketDetailClient";

export const metadata: Metadata = {
    title: "Support Ticket | Dashboard",
    description: "View and respond to your support ticket."
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
    const user = await authenticateUser();
    if (!user) redirect("/login");

    const { id } = await params;

    // Get token for socket connection
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    return <TicketDetailClient ticketId={id} userId={user._id} socketToken={token} />;
}

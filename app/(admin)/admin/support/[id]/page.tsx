import { Metadata } from "next";
import { authenticateUser } from "@/middleware/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminTicketClient from "./AdminTicketClient";

export const metadata: Metadata = {
    title: "Ticket Details | Admin Support",
    description: "View and respond to support ticket"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminTicketPage({ params }: PageProps) {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") redirect("/");

    const { id } = await params;

    // Get token for socket connection
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    return <AdminTicketClient ticketId={id} adminId={user._id} socketToken={token} />;
}

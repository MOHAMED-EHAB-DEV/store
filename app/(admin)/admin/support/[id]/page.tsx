import { Metadata } from "next";
import { authenticateUser } from "@/middleware/auth";
import { redirect } from "next/navigation";
import AdminTicketClient from "./AdminTicketClient";

export const metadata: Metadata = {
    title: "Ticket Details | Admin Support",
    description: "View and respond to support ticket"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminTicketPage({ params }: PageProps) {
    const { id } = await params;

    return <AdminTicketClient ticketId={id} />;
}

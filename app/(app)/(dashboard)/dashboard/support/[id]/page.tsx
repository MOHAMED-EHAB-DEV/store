import { Metadata } from "next";
import TicketDetailClient from "./TicketDetailClient";

export const metadata: Metadata = {
    title: "Support Ticket | Dashboard",
    description: "View and respond to your support ticket."
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
    const { id } = await params;

    return <TicketDetailClient ticketId={id} />;
}

"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

interface TicketCardProps {
    ticket: {
        _id: string;
        subject: string;
        status: "open" | "resolved" | "closed";
        priority: "low" | "medium" | "high" | "urgent";
        category: string;
        lastMessageAt: string;
        createdAt: string;
        user?: {
            name: string;
            email: string;
            avatar?: string;
        };
    };
    href: string;
    showUser?: boolean;
}

export default function TicketCard({ ticket, href, showUser = false }: TicketCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    return (
        <Link
            href={href}
            className="block group"
        >
            <div className="glass rounded-xl p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                            {ticket.subject}
                        </h3>

                        {showUser && ticket.user && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {ticket.user.name} • {ticket.user.email}
                            </p>
                        )}

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                            <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 rounded-full bg-white/5">
                                {ticket.category}
                            </span>
                        </div>
                    </div>

                    <div className="text-right text-xs text-muted-foreground shrink-0">
                        <p>Updated</p>
                        <p className="text-white/80">{formatDate(ticket.lastMessageAt)}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

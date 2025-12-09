"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import TicketCard from "@/components/Support/TicketCard";

export default function DashboardSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, closed: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetchTickets();
    }, [filter]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: "20" });
            if (filter) params.set("status", filter);

            const response = await fetch(`/api/support/tickets?${params}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setTickets(data.data || []);

            // Calculate stats from all tickets (fetch without filter for stats)
            if (!filter) {
                const allTickets = data.data || [];
                setStats({
                    total: data.pagination?.total || allTickets.length,
                    open: allTickets.filter((t: any) => t.status === "open").length,
                    resolved: allTickets.filter((t: any) => t.status === "resolved").length,
                    closed: allTickets.filter((t: any) => t.status === "closed").length
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch tickets");
        } finally {
            setIsLoading(false);
        }
    };

    const statCards = [
        { label: "Total", value: stats.total, color: "from-purple-500 to-pink-500", filterValue: "" },
        { label: "Open", value: stats.open, color: "from-emerald-500 to-teal-500", filterValue: "open" },
        { label: "Resolved", value: stats.resolved, color: "from-blue-500 to-cyan-500", filterValue: "resolved" },
        { label: "Closed", value: stats.closed, color: "from-gray-500 to-slate-500", filterValue: "closed" }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Support Tickets</h1>
                    <p className="text-muted-foreground">Track and manage your support requests</p>
                </div>

                <Link href="/support" className="btn btn-primary shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Ticket
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <button
                        key={stat.label}
                        onClick={() => setFilter(stat.filterValue)}
                        className={`glass rounded-xl p-4 text-left transition-all hover:scale-105 ${filter === stat.filterValue ? "ring-2 ring-purple-500" : ""
                            }`}
                    >
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                        </p>
                    </button>
                ))}
            </div>

            {/* Tickets List */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        {filter ? `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tickets` : "All Tickets"}
                    </h2>
                    {filter && (
                        <button
                            onClick={() => setFilter("")}
                            className="text-xs text-purple-400 hover:text-purple-300"
                        >
                            Clear filter
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {filter ? `No ${filter} tickets` : "No tickets yet"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {filter ? "Try clearing the filter" : "Create a support ticket to get help from our team"}
                        </p>
                        <Link href="/support" className="btn btn-primary inline-flex">
                            Create Your First Ticket
                        </Link>
                    </div>
                ) : (
                    <div className="p-4 space-y-3">
                        {tickets.map((ticket) => (
                            <TicketCard
                                key={ticket._id}
                                ticket={ticket}
                                href={`/dashboard/support/${ticket._id}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

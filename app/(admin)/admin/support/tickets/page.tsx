"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import TicketCard from "@/components/Support/TicketCard";

const statusFilters = [
    { value: "", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" }
];

const priorityFilters = [
    { value: "", label: "All Priority" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
];

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "", priority: "" });

    const fetchTickets = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "20" });
            if (filters.status) params.set("status", filters.status);
            if (filters.priority) params.set("priority", filters.priority);

            const response = await fetch(`/api/admin/support?${params}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setTickets(data.data || []);
            setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch tickets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">All Tickets</h1>
                    <p className="text-muted-foreground">
                        {pagination.total} total tickets
                    </p>
                </div>

                <Link href="/admin/support" className="text-sm text-purple-400 hover:text-purple-300">
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                    {statusFilters.map(f => (
                        <option key={f.value} value={f.value} className="bg-[#15161b]">{f.label}</option>
                    ))}
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                    {priorityFilters.map(f => (
                        <option key={f.value} value={f.value} className="bg-[#15161b]">{f.label}</option>
                    ))}
                </select>
            </div>

            {/* Tickets List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : tickets.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">No tickets found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <TicketCard
                            key={ticket._id}
                            ticket={ticket}
                            href={`/admin/support/${ticket._id}`}
                            showUser
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => fetchTickets(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-3 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => fetchTickets(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="px-3 py-2 rounded-lg bg-white/5 text-white disabled:opacity-50 hover:bg-white/10 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sonnerToast } from "@/components/ui/sonner";
import TicketCard from "@/components/Support/TicketCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const statusFilters = [
    { value: "all", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" }
];

const priorityFilters = [
    { value: "all", label: "All Priority" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" }
];

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "all", priority: "all" });

    const fetchTickets = async (page = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "20" });
            if (filters.status && filters.status !== "all") params.set("status", filters.status);
            if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);

            const response = await fetch(`/api/admin/support?${params}`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setTickets(data.data || []);
            setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
        } catch (error: any) {
            if (error && typeof error === 'object' && 'digest' in error) throw error;
            sonnerToast.error(error.message || "Failed to fetch tickets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="All Tickets"
                description={`${pagination.total} total tickets`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Support", href: "/admin/support" },
                    { label: "All Tickets" }
                ]}
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select
                    value={filters.status}
                    onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15161b] border-white/10 text-white">
                        {statusFilters.map(f => (
                            <SelectItem key={f.value} value={f.value}>
                                {f.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.priority}
                    onValueChange={(val) => setFilters(prev => ({ ...prev, priority: val }))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#15161b] border-white/10 text-white">
                        {priorityFilters.map(f => (
                            <SelectItem key={f.value} value={f.value}>
                                {f.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => fetchTickets(pagination.page - 1)}
                            className="bg-white/5 border-white/10 text-white"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => fetchTickets(pagination.page + 1)}
                            className="bg-white/5 border-white/10 text-white"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

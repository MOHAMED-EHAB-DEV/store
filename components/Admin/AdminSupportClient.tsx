"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Headset, Calendar, Clock, Check } from "@/components/ui/svgs/Icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Ticket {
    _id: string;
    subject: string;
    user: { _id: string; name: string; email: string };
    status: "open" | "in-progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "urgent";
    category: string;
    createdAt: string;
    updatedAt: string;
}

interface AdminSupportClientProps {
    initialData: Ticket[];
    stats: {
        total: number;
        open: number;
        inProgress: number;
        closed: number;
    };
    pagination: any;
    searchParams: any;
}

export default function AdminSupportClient({
    initialData,
    stats,
    pagination,
    searchParams,
}: AdminSupportClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const queryParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const filterOptions: FilterOption[] = [
        {
            key: "status",
            label: "Status",
            options: [
                { value: "open", label: "Open" },
                { value: "in-progress", label: "In Progress" },
                { value: "closed", label: "Closed" },
            ],
        },
        {
            key: "priority",
            label: "Priority",
            options: [
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
            ],
        },
    ];

    const updateQuery = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(queryParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        if (!updates.page) params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500/10 text-red-400 border-red-500/20";
            case "high":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "medium":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
            case "low":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            default:
                return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-green-500/10 text-green-400 border-green-500/20";
            case "in-progress":
                return "bg-blue-500/10 text-blue-400 border-blue-500/20";
            case "closed":
                return "bg-gray-500/10 text-gray-400 border-gray-500/20";
            default:
                return "bg-gray-500/10 text-gray-400 border-gray-500/20";
        }
    };

    const columns: Column<Ticket>[] = [
        {
            key: "subject",
            label: "Ticket",
            sortable: true,
            render: (ticket) => (
                <div>
                    <p className="text-sm font-medium text-white">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">ID: #{ticket._id.slice(-8)}</p>
                </div>
            ),
        },
        {
            key: "user",
            label: "User",
            render: (ticket) => (
                <div>
                    <p className="text-sm font-medium text-white">{ticket.user?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{ticket.user?.email || "N/A"}</p>
                </div>
            ),
        },
        {
            key: "priority",
            label: "Priority",
            sortable: true,
            render: (ticket) => (
                <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                </Badge>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (ticket) => (
                <Badge variant="outline" className={getStatusColor(ticket.status)}>
                    {ticket.status.replace("-", " ").toUpperCase()}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            sortable: true,
            render: (ticket) => (
                <time className="text-sm text-muted-foreground" dateTime={ticket.createdAt}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                </time>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (ticket) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "View Chat",
                            onClick: () => router.push(`/admin/support/${ticket._id}`),
                        },
                    ]}
                />
            ),
        },
    ];

    const statCardsData = [
        {
            label: "Total Tickets",
            value: stats.total,
            icon: Headset,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Open",
            value: stats.open,
            icon: Clock,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "In Progress",
            value: stats.inProgress,
            icon: Clock,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Closed",
            value: stats.closed,
            icon: Check,
            gradient: "from-gray-500 to-slate-500",
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Support Tickets"
                description="Manage all support tickets and customer inquiries"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Support" },
                ]}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCardsData.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="space-y-6">
                <SearchFilterBar
                    searchPlaceholder="Search tickets..."
                    onSearchChange={(val) => updateQuery({ search: val })}
                    filters={filterOptions}
                    onFilterChange={(key, val) => updateQuery({ [key]: val })}
                    activeFilters={{
                        status: queryParams.get("status") || "",
                        priority: queryParams.get("priority") || "",
                    }}
                    onClearFilters={() => updateQuery({ status: "", priority: "", search: "" })}
                />

                <DataTable
                    columns={columns}
                    data={initialData}
                    keyExtractor={(ticket) => ticket._id}
                    loading={loading}
                    exportFilename="tickets"
                    emptyState={
                        <EmptyState
                            icon={Headset}
                            title="No tickets found"
                            description="Try adjusting your filters or search query"
                        />
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-2">
                                Showing {initialData.length} of {pagination?.total || 0} entries
                            </span>
                        </div>
                    }
                />

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => updateQuery({ page: (pagination.page - 1).toString() })}
                                className="bg-white/5 border-white/10 text-white"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => updateQuery({ page: (pagination.page + 1).toString() })}
                                className="bg-white/5 border-white/10 text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

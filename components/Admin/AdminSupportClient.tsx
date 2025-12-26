"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Headset, Calendar } from "@/components/ui/svgs/Icons";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    tickets: Ticket[];
}

export default function AdminSupportClient({ tickets }: AdminSupportClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const openCount = tickets.filter((t) => t.status === "open").length;
        const inProgressCount = tickets.filter((t) => t.status === "in-progress").length;
        const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
        const recentCount = tickets.filter((t) => new Date(t.createdAt) >= last24h).length;

        const resolutionRate = tickets.length > 0
            ? (resolvedCount / tickets.length) * 100
            : 0;

        return {
            total: tickets.length,
            open: openCount,
            inProgress: inProgressCount,
            resolved: resolvedCount,
            recent24h: recentCount,
            resolutionRate: resolutionRate.toFixed(1),
        };
    }, [tickets]);

    // Filter options
    const filterOptions: FilterOption[] = [
        {
            key: "status",
            label: "Status",
            options: [
                { value: "open", label: "Open" },
                { value: "in-progress", label: "In Progress" },
                { value: "resolved", label: "Resolved" },
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

    // Filtered tickets
    const filteredTickets = useMemo(() => {
        let result = tickets;

        // Search filter
        if (searchQuery) {
            result = result.filter(
                (ticket) =>
                    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    ticket.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (filters.status) {
            result = result.filter((ticket) => ticket.status === filters.status);
        }

        // Priority filter
        if (filters.priority) {
            result = result.filter((ticket) => ticket.priority === filters.priority);
        }

        return result;
    }, [tickets, searchQuery, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500/20 text-red-300 border-red-500/30";
            case "high":
                return "bg-orange-500/20 text-orange-300 border-orange-500/30";
            case "medium":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            case "low":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-green-500/20 text-green-300 border-green-500/30";
            case "in-progress":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "resolved":
                return "bg-purple-500/20 text-purple-300 border-purple-500/30";
            case "closed":
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    // Table columns
    const columns: Column<Ticket>[] = [
        {
            key: "subject",
            label: "Subject",
            sortable: true,
            render: (ticket) => (
                <div>
                    <p className="text-sm font-medium text-white">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">#{ticket._id.slice(-8)}</p>
                </div>
            ),
        },
        {
            key: "user",
            label: "User",
            sortable: true,
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
                <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                </Badge>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (ticket) => (
                <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace("-", " ")}
                </Badge>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (ticket) => (
                <span className="text-sm text-muted-foreground">
                    {ticket.category || "General"}
                </span>
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
                <Link href={`/admin/support/${ticket._id}`}>
                    <button className="text-sm text-primary hover:underline">
                        View Details
                    </button>
                </Link>
            ),
        },
    ];

    const statCards = [
        {
            label: "Total Tickets",
            value: stats.total,
            subtext: `${stats.recent24h} in last 24h`,
            icon: Headset,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Open Tickets",
            value: stats.open,
            subtext: "Awaiting response",
            icon: Headset,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "In Progress",
            value: stats.inProgress,
            subtext: "Being handled",
            icon: Headset,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Resolution Rate",
            value: `${stats.resolutionRate}%`,
            subtext: `${stats.resolved} resolved`,
            icon: Calendar,
            gradient: "from-amber-500 to-orange-500",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Support Tickets"
                description={`${tickets.length} total tickets`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Support" },
                ]}
            />

            {/* Stats Grid */}
            <section aria-label="Ticket statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </section>

            {/* Search and Filters */}
            <SearchFilterBar
                searchPlaceholder="Search by subject, user, or email..."
                onSearchChange={setSearchQuery}
                filters={filterOptions}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                onClearFilters={handleClearFilters}
            />

            {/* Tickets Table */}
            {filteredTickets.length === 0 && (searchQuery || Object.keys(filters).length > 0) ? (
                <EmptyState
                    icon={Headset}
                    title="No tickets found"
                    description="Try adjusting your search or filters"
                    action={{
                        label: "Clear Filters",
                        onClick: handleClearFilters,
                    }}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredTickets}
                    keyExtractor={(ticket) => ticket._id}
                    exportFilename="support-tickets"
                    emptyState={
                        <EmptyState
                            icon={Headset}
                            title="No tickets yet"
                            description="Support tickets will appear here when users submit them"
                        />
                    }
                />
            )}
        </div>
    );
}

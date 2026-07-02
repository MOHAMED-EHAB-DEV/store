"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Headset } from "@/components/ui/svgs/icons/Headset";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Check } from "@/components/ui/svgs/icons/Check";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sonnerToast } from "@/components/ui/sonner";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

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

    const handleBulkDelete = async () => {

        setIsDeleting(true);
        try {
            const response = await fetch("/api/admin/support/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketIds: selectedIds }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} tickets deleted successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete tickets");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkStatusChange = async (status: string) => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/support/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketIds: selectedIds, updates: { status } }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} tickets updated successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update tickets");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
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
                        ...createDefaultActions({
                            onView: () => router.push(`/admin/support/${ticket._id}`),
                            onDelete: () => {
                                setSelectedIds([ticket._id]);
                                setBulkDeleteDialog(true);
                            }
                        })
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

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-sm text-white">
                            {selectedIds.length} ticket{selectedIds.length !== 1 ? "s" : ""} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => handleBulkStatusChange("closed")}
                                disabled={loading}
                            >
                                Mark Closed
                            </Button>
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => handleBulkStatusChange("open")}
                                disabled={loading}
                            >
                                Mark Open
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBulkDeleteDialog(true)}
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selectedIds.length})
                            </Button>
                        </div>
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={initialData}
                    keyExtractor={(ticket) => ticket._id}
                    loading={loading}
                    selectable
                    onSelectionChange={(ids) => setSelectedIds(ids as string[])}
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
            <ConfirmDialog
                open={bulkDeleteDialog}
                onOpenChange={setBulkDeleteDialog}
                onConfirm={handleBulkDelete}
                title="Delete Tickets"
                description={`Are you sure you want to delete ${selectedIds.length} tickets? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

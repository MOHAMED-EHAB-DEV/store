"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Templates } from "@/components/ui/svgs/icons/Templates";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DownloadLog {
    _id: string;
    templateId: { _id: string; title: string; thumbnail: string };
    userId: { _id: string; name: string; email: string; avatar: string };
    status: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

interface DownloadLogsClientProps {
    initialData: DownloadLog[];
    stats: {
        total: number;
        uniqueTemplates: number;
        uniqueUsers: number;
    };
    pagination: any;
    searchParams: any;
}

export default function DownloadLogsClient({
    initialData,
    stats,
    pagination,
    searchParams,
}: DownloadLogsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const queryParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    const filterOptions: FilterOption[] = [
        {
            key: "status",
            label: "Status",
            options: [
                { value: "completed", label: "Completed" },
                { value: "failed", label: "Failed" },
                { value: "pending", label: "Pending" },
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

    const columns: Column<DownloadLog>[] = [
        {
            key: "templateId",
            label: "Template",
            render: (log) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0">
                        {log.templateId?.thumbnail ? (
                            <img src={log.templateId.thumbnail} alt={log.templateId.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Templates className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-white line-clamp-1">{log.templateId?.title || "Deleted Template"}</p>
                </div>
            ),
        },
        {
            key: "userId",
            label: "User",
            render: (log) => (
                <div>
                    <p className="text-sm font-medium text-white">{log.userId?.name || "Guest"}</p>
                    <p className="text-xs text-muted-foreground">{log.userId?.email || "N/A"}</p>
                </div>
            ),
        },
        {
            key: "ipAddress",
            label: "IP Address",
            render: (log) => <span className="text-xs font-mono text-muted-foreground">{log.ipAddress}</span>,
        },
        {
            key: "status",
            label: "Status",
            render: (log) => (
                <Badge
                    variant="outline"
                    className={
                        log.status === "completed"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }
                >
                    {log.status.toUpperCase()}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Date",
            sortable: true,
            render: (log) => (
                <div>
                    <p className="text-sm text-white">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</p>
                </div>
            ),
        },
    ];

    const statCardsData = [
        {
            label: "Total Downloads",
            value: stats.total,
            icon: Download,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Unique Templates",
            value: stats.uniqueTemplates,
            icon: Templates,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Unique Users",
            value: stats.uniqueUsers,
            icon: Users,
            gradient: "from-amber-500 to-orange-500",
        },
        {
            label: "Current Period",
            value: initialData.length,
            icon: Calendar,
            gradient: "from-green-500 to-emerald-500",
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Download Logs"
                description="Monitor and analyze template download activity"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Download Logs" },
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
                    searchPlaceholder="Search logs..."
                    onSearchChange={(val) => updateQuery({ search: val })}
                    filters={filterOptions}
                    onFilterChange={(key, val) => updateQuery({ [key]: val })}
                    activeFilters={{
                        status: queryParams.get("status") || "",
                    }}
                    onClearFilters={() => updateQuery({ status: "", search: "" })}
                />

                <DataTable
                    columns={columns}
                    data={initialData}
                    keyExtractor={(log) => log._id}
                    loading={loading}
                    exportFilename="download-logs"
                    emptyState={
                        <EmptyState
                            icon={Download}
                            title="No logs found"
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

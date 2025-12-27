"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import ChartCard, { ChartDataPoint } from "@/components/Dashboard/shared/ChartCard";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Download, Calendar, Users, Templates } from "@/components/ui/svgs/Icons";
import { Badge } from "@/components/ui/badge";
import { IDownloadLog } from "@/types";
import { capitalizeFirstChar } from "@/lib/utils";

interface DownloadLogsClientProps {
    logs: IDownloadLog[];
}

export default function DownloadLogsClient({ logs }: DownloadLogsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentLogs = logs.filter((log) => new Date(log.createdAt) >= last30Days);
        const weekLogs = logs.filter((log) => new Date(log.createdAt) >= last7Days);

        const successRate = logs.length > 0
            ? (logs.filter((log) => log.status === "success").length / logs.length) * 100
            : 0;

        // Get unique users and templates
        const uniqueUsers = new Set(logs.map((log) => log.userId?._id).filter(Boolean)).size;
        const uniqueTemplates = new Set(logs.map((log) => log.templateId?._id).filter(Boolean)).size;

        return {
            total: logs.length,
            last30Days: recentLogs.length,
            last7Days: weekLogs.length,
            successRate: successRate.toFixed(1),
            uniqueUsers,
            uniqueTemplates,
        };
    }, [logs]);

    // Prepare chart data - Downloads over last 30 days
    const downloadsChartData: ChartDataPoint[] = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date;
        });

        return last30Days.map((date) => {
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            const count = logs.filter((log) => {
                const createdAt = new Date(log.createdAt);
                return createdAt >= dayStart && createdAt < dayEnd;
            }).length;

            return {
                date: dayStart,
                value: count,
            };
        });
    }, [logs]);

    // Filter options
    const filterOptions: FilterOption[] = [
        {
            key: "status",
            label: "Status",
            options: [
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
            ],
        },
    ];

    // Filtered logs
    const filteredLogs = useMemo(() => {
        let result = logs;

        // Search filter
        if (searchQuery) {
            result = result.filter(
                (log) =>
                    log.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    log.templateId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (filters.status) {
            result = result.filter((log) => log.status === filters.status);
        }

        return result;
    }, [logs, searchQuery, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    // Table columns
    const columns: Column<IDownloadLog>[] = [
        {
            key: "template",
            label: "Template",
            sortable: true,
            render: (log) => (
                <div>
                    <p className="text-sm font-medium text-white">{log.templateId?.title || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{log.templateId?.slug || "N/A"}</p>
                </div>
            ),
        },
        {
            key: "user",
            label: "User",
            sortable: true,
            render: (log) => (
                <div>
                    <p className="text-sm font-medium text-white">{log.userId?.name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{log.userId?.email || "N/A"}</p>
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (log) => (
                <Badge
                    className={
                        log.status === "success"
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                    }
                >
                    {capitalizeFirstChar(log.status)}
                </Badge>
            ),
        },
        {
            key: "ipAddress",
            label: "IP Address",
            render: (log) => (
                <span className="text-sm text-muted-foreground font-mono">
                    {log.ip || "N/A"}
                </span>
            ),
        },
        {
            key: "createdAt",
            label: "Date",
            sortable: true,
            render: (log) => (
                <time className="text-sm text-muted-foreground" dateTime={log.createdAt as unknown as string}>
                    {new Date(log.createdAt).toLocaleString()}
                </time>
            ),
        },
    ];

    const statCards = [
        {
            label: "Total Downloads",
            value: stats.total,
            subtext: `${stats.last30Days} in last 30 days`,
            icon: Download,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "This Week",
            value: stats.last7Days,
            subtext: "Last 7 days",
            icon: Calendar,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Unique Users",
            value: stats.uniqueUsers,
            subtext: "Total downloaders",
            icon: Users,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Success Rate",
            value: `${stats.successRate}%`,
            subtext: "Successful downloads",
            icon: Templates,
            gradient: "from-amber-500 to-orange-500",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Download Logs"
                description={`${logs.length} total downloads tracked`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Download Logs" },
                ]}
            />

            {/* Stats Grid */}
            <section aria-label="Download statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </section>

            {/* Downloads Chart */}
            <section aria-label="Download trends">
                <ChartCard
                    title="Downloads Over Time (Last 30 Days)"
                    data={downloadsChartData}
                    type="area"
                    gradient="from-green-500 to-emerald-500"
                    height={250}
                    showGrid
                />
            </section>

            {/* Search and Filters */}
            <SearchFilterBar
                searchPlaceholder="Search by template, user, or email..."
                onSearchChange={setSearchQuery}
                filters={filterOptions}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                onClearFilters={handleClearFilters}
            />

            {/* Download Logs Table */}
            {filteredLogs.length === 0 && (searchQuery || Object.keys(filters).length > 0) ? (
                <EmptyState
                    icon={Download}
                    title="No downloads found"
                    description="Try adjusting your search or filters"
                    action={{
                        label: "Clear Filters",
                        onClick: handleClearFilters,
                    }}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredLogs}
                    keyExtractor={(log) => log._id}
                    exportFilename="download-logs"
                    emptyState={
                        <EmptyState
                            icon={Download}
                            title="No downloads yet"
                            description="Download logs will appear here when users download templates"
                        />
                    }
                />
            )}
        </div>
    );
}

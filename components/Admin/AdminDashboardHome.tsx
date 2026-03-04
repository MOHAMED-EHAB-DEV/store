"use client";

import React, { useMemo } from "react";
import StatCard from "@/components/Dashboard/shared/StatCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import ChartCard, { ChartDataPoint } from "@/components/Dashboard/shared/ChartCard";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Templates } from "@/components/ui/svgs/icons/Templates";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Headset } from "@/components/ui/svgs/icons/Headset";
import { TrendingUp } from "@/components/ui/svgs/icons/TrendingUp";
import { TrendingDown } from "@/components/ui/svgs/icons/TrendingDown";

interface AdminDashboardHomeProps {
    data: {
        users: any[];
        templates: any[];
        downloads: any[];
        tickets: any[];
    };
}

export default function AdminDashboardHome({ data }: AdminDashboardHomeProps) {
    const { users, templates, downloads, tickets } = data;

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const newUsersThisMonth = users.filter((u: any) => new Date(u.createdAt) >= lastMonth).length;
        const newTemplatesThisMonth = templates.filter((t: any) => new Date(t.createdAt) >= lastMonth).length;
        const downloadsThisMonth = downloads.filter((d: any) => new Date(d.createdAt) >= lastMonth).length;
        const activeTickets = tickets.filter((t: any) => t.status !== "resolved" && t.status !== "closed").length;

        const userGrowth = users.length > 0 ? (newUsersThisMonth / users.length) * 100 : 0;
        const templateGrowth = templates.length > 0 ? (newTemplatesThisMonth / templates.length) * 100 : 0;

        return {
            totalUsers: users.length,
            newUsersThisMonth,
            userGrowth,
            totalTemplates: templates.length,
            newTemplatesThisMonth,
            templateGrowth,
            totalDownloads: downloads.length,
            downloadsThisMonth,
            activeTickets,
            totalTickets: tickets.length,
        };
    }, [users, templates, downloads, tickets]);

    // Prepare chart data
    const userGrowthData: ChartDataPoint[] = useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            return date;
        });

        return last6Months.map((date) => {
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const count = users.filter((u: any) => {
                const createdAt = new Date(u.createdAt);
                return createdAt >= monthStart && createdAt <= monthEnd;
            }).length;

            return {
                date: new Date(date.getFullYear(), date.getMonth(), 15), // Mid-month
                value: count,
            };
        });
    }, [users]);

    const downloadsData: ChartDataPoint[] = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date;
        });

        return last30Days.map((date) => {
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            const count = downloads.filter((d: any) => {
                const createdAt = new Date(d.createdAt);
                return createdAt >= dayStart && createdAt < dayEnd;
            }).length;

            return {
                date: dayStart,
                value: count,
            };
        });
    }, [downloads]);

    const statCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            subtext: `+${stats.newUsersThisMonth} this month`,
            icon: Users,
            gradient: "from-purple-500 to-pink-500",
            href: "/admin/users",
            trend: { value: stats.userGrowth, isPositive: stats.userGrowth > 0 },
        },
        {
            label: "Templates",
            value: stats.totalTemplates,
            subtext: `+${stats.newTemplatesThisMonth} this month`,
            icon: Templates,
            gradient: "from-blue-500 to-cyan-500",
            href: "/admin/templates",
            trend: { value: stats.templateGrowth, isPositive: stats.templateGrowth > 0 },
        },
        {
            label: "Total Downloads",
            value: stats.totalDownloads,
            subtext: `${stats.downloadsThisMonth} this month`,
            icon: Download,
            gradient: "from-green-500 to-emerald-500",
            href: "/admin/download-logs",
        },
        {
            label: "Active Tickets",
            value: stats.activeTickets,
            subtext: `${stats.totalTickets} total`,
            icon: Headset,
            gradient: "from-amber-500 to-orange-500",
            href: "/admin/support",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Admin Dashboard"
                description="Comprehensive analytics and insights"
            />

            {/* Stats Grid */}
            <section aria-label="Key metrics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </section>

            {/* Charts Grid */}
            <section aria-label="Analytics charts" className="grid lg:grid-cols-2 gap-6">
                <ChartCard
                    title="User Growth (Last 6 Months)"
                    data={userGrowthData}
                    type="area"
                    gradient="from-purple-500 to-pink-500"
                    height={250}
                    showGrid
                />
                <ChartCard
                    title="Downloads (Last 30 Days)"
                    data={downloadsData}
                    type="line"
                    gradient="from-green-500 to-emerald-500"
                    height={250}
                    showGrid
                />
            </section>

            {/* Quick Stats */}
            <section aria-label="Additional statistics">
                <div className="grid md:grid-cols-3 gap-4">
                    <article className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Premium Users</h3>
                            <TrendingUp className="w-4 h-4 text-green-400" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {users.filter((u: any) => u.tier === "premium").length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {((users.filter((u: any) => u.tier === "premium").length / users.length) * 100).toFixed(1)}% of total users
                        </p>
                    </article>

                    <article className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Avg Downloads/Template</h3>
                            <Download className="w-4 h-4 text-blue-400" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {templates.length > 0 ? (downloads.length / templates.length).toFixed(1) : 0}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Based on {downloads.length} total downloads
                        </p>
                    </article>

                    <article className="glass rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Ticket Resolution Rate</h3>
                            <Headset className="w-4 h-4 text-amber-400" aria-hidden="true" />
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {tickets.length > 0
                                ? ((tickets.filter((t: any) => t.status === "resolved").length / tickets.length) * 100).toFixed(1)
                                : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            {tickets.filter((t: any) => t.status === "resolved").length} resolved tickets
                        </p>
                    </article>
                </div>
            </section>

            {/* Recent Activity */}
            <section aria-label="Recent activity" className="grid lg:grid-cols-2 gap-6">
                <article className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-semibold text-white">Recent Users</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {users.slice(0, 5).map((user: any) => (
                            <div key={user._id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-semibold text-white">Recent Downloads</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {downloads.slice(0, 5).map((download: any) => (
                            <div key={download._id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {download.templateId?.title || "Unknown Template"}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        by {download.userId?.name || "Unknown User"}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {new Date(download.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}

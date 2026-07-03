"use client";

import { useMemo } from "react";
import StatCard from "@/components/Dashboard/shared/StatCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import ChartCard, {
  ChartDataPoint,
} from "@/components/Dashboard/shared/ChartCard";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Templates } from "@/components/ui/svgs/icons/Templates";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Headset } from "@/components/ui/svgs/icons/Headset";
import { TrendingUp } from "@/components/ui/svgs/icons/TrendingUp";

interface AdminDashboardHomeProps {
  data: {
    users: any[];
    templates: any[];
    downloads: any[];
    tickets: any[];
    adminStats?: {
      stats: {
        totalUsers: number;
        newUsersThisMonth: number;
        userGrowth: number;
        totalTemplates: number;
        newTemplatesThisMonth: number;
        templateGrowth: number;
        totalDownloads: number;
        downloadsThisMonth: number;
        activeTickets: number;
        totalTickets: number;
      };
      userGrowthData: ChartDataPoint[];
      downloadsData: ChartDataPoint[];
    };
  };
}

export default function AdminDashboardHome({ data }: AdminDashboardHomeProps) {
  const { users, templates, downloads, tickets, adminStats } = data;

  // Use server calculated stats or fallbacks if not available
  const stats = adminStats?.stats || {
    totalUsers: users.length,
    newUsersThisMonth: 0,
    userGrowth: 0,
    totalTemplates: templates.length,
    newTemplatesThisMonth: 0,
    templateGrowth: 0,
    totalDownloads: downloads.length,
    downloadsThisMonth: 0,
    activeTickets: tickets.length,
    totalTickets: tickets.length,
  };

  const userGrowthData: ChartDataPoint[] = adminStats?.userGrowthData || [];
  const downloadsData: ChartDataPoint[] = adminStats?.downloadsData || [];

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
      trend: {
        value: stats.templateGrowth,
        isPositive: stats.templateGrowth > 0,
      },
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
      <section
        aria-label="Analytics charts"
        className="grid lg:grid-cols-2 gap-6"
      >
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
              <h3 className="text-sm font-medium text-muted-foreground">
                Premium Users
              </h3>
              <TrendingUp
                className="w-4 h-4 text-green-400"
                aria-hidden="true"
              />
            </div>
            <p className="text-3xl font-bold text-white">
              {users.filter((u: any) => u.tier === "pro" || u.tier === "lifetime").length}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {(
                (users.filter((u: any) => u.tier === "pro" || u.tier === "lifetime").length /
                  users.length) *
                100
              ).toFixed(1)}
              % of total users
            </p>
          </article>

          <article className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Avg Downloads/Template
              </h3>
              <Download className="w-4 h-4 text-blue-400" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-white">
              {templates.length > 0
                ? (downloads.length / templates.length).toFixed(1)
                : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {downloads.length} total downloads
            </p>
          </article>

          <article className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Ticket Resolution Rate
              </h3>
              <Headset className="w-4 h-4 text-amber-400" aria-hidden="true" />
            </div>
            <p className="text-3xl font-bold text-white">
              {tickets.length > 0
                ? (
                    (tickets.filter((t: any) => t.status === "resolved")
                      .length /
                      tickets.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {tickets.filter((t: any) => t.status === "resolved").length}{" "}
              resolved tickets
            </p>
          </article>
        </div>
      </section>

      {/* Recent Activity */}
      <section
        aria-label="Recent activity"
        className="grid lg:grid-cols-2 gap-6"
      >
        <article className="glass rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">Recent Users</h2>
          </div>
          <div className="divide-y divide-white/5">
            {users.slice(0, 5).map((user: any) => (
              <div
                key={user._id}
                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
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
              <div
                key={download._id}
                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
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

"use client";

import StatCard from "@/components/Dashboard/shared/StatCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import ChartCard, { ChartDataPoint } from "@/components/Dashboard/shared/ChartCard";
import { Users } from "@/components/ui/svgs/icons/Users";
import { Target } from "@/components/ui/svgs/icons/Target";
import { Globe } from "@/components/ui/svgs/icons/Globe";
import { Calendar } from "@/components/ui/svgs/icons/Calendar";
import { History } from "@/components/ui/svgs/icons/History";

interface AdminAnalyticsClientProps {
  data: {
    stats: {
      totalVisitors: number;
      uniqueLast24h: number;
      uniqueLast7d: number;
      uniqueLast30d: number;
      topPages: { path: string; count: number }[];
      dailyVisits: { date: string; count: number }[];
    } | null;
    recentVisitors: any[];
  };
}

export default function AdminAnalyticsClient({ data }: AdminAnalyticsClientProps) {
  const { stats, recentVisitors } = data;

  if (!stats) {
    return (
      <div className="p-6">
        <PageHeader title="Visitor Analytics" description="Could not load analytics data." />
      </div>
    );
  }

  // Calculate percentage changes or trends if needed. For now, we can just show static trends since we don't have historical comparison data.
  const statCards = [
    {
      label: "Total Visitors",
      value: stats.totalVisitors,
      subtext: "All time unique visitors",
      icon: Users,
      gradient: "from-blue-500 to-indigo-500",
      trend: { value: 10, isPositive: true }, 
    },
    {
      label: "Active last 24h",
      value: stats.uniqueLast24h,
      subtext: "Daily active users",
      icon: Target,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Active last 7 days",
      value: stats.uniqueLast7d,
      subtext: "Weekly active users",
      icon: Calendar,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Active last 30 days",
      value: stats.uniqueLast30d,
      subtext: "Monthly active users",
      icon: Globe,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const chartData: ChartDataPoint[] = stats.dailyVisits.map((visit) => ({
    date: new Date(visit.date),
    value: visit.count,
  }));

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Visitor Analytics"
        description="Monitor website traffic and user engagement."
      />

      {/* Stats Grid */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Charts & Top Pages */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Daily Unique Visitors (Last 30 Days)"
            data={chartData}
            type="area"
            gradient="from-blue-500 to-indigo-500"
            height={320}
            showGrid
          />
        </div>

        <article className="glass rounded-xl overflow-hidden flex flex-col h-full border-white/5 border">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white">Top Pages Visited</h2>
          </div>
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {stats.topPages.length > 0 ? (
              <ul className="divide-y divide-white/5">
                {stats.topPages.map((page, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col gap-1 p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate max-w-[200px]" title={page.path}>
                        {page.path}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-white">
                        {page.count} {page.count === 1 ? 'visit' : 'visits'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No page data available.
              </div>
            )}
          </div>
        </article>
      </section>

      {/* Recent Visitors Table */}
      <section aria-label="Recent Visitors">
        <div className="glass rounded-xl overflow-hidden border-white/5 border">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="font-semibold text-white">Recent Visitors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visitor ID</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Visits</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source OS/Browser</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Active</th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-white font-mono" title={visitor.visitorId}>
                          {visitor.visitorId.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {visitor.visitCount} times
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-[150px] truncate" title={visitor.userAgent}>
                      {visitor.userAgent || "Unknown"}
                    </td>
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(visitor.lastVisit).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                       <a href={`/admin/analytics/${visitor._id}`} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                          View Journey
                       </a>
                    </td>
                  </tr>
                ))}
                {recentVisitors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No recent visitors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

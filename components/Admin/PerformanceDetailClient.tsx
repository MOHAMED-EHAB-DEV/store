"use client";

import Link from "next/link";
import StatCard from "@/components/Dashboard/shared/StatCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { MousePointer } from "@/components/ui/svgs/icons/MousePointer";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Activity } from "@/components/ui/svgs/icons/Activity";
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";
import { History } from "@/components/ui/svgs/icons/History";
import { User } from "@/components/ui/svgs/icons/User";

interface Metric {
  name: string;
  value: number;
  rating: string;
  delta: number;
}

interface PageEntry {
  date: string;
  path: string;
  createdAt: string;
  metrics: Metric[];
}

interface PerformanceDetailClientProps {
  data: {
    visitorId: string;
    visitorInfo: any;
    averages: { name: string; average: number; count: number }[];
    pages: PageEntry[];
  } | null;
  visitorId: string;
}

export default function PerformanceDetailClient({
  data,
  visitorId,
}: PerformanceDetailClientProps) {
  if (!data) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/admin/performance"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Performance
          </Link>
        </div>
        <PageHeader
          title="Performance Details"
          description="Could not load performance details for this visitor."
        />
      </div>
    );
  }

  const { visitorInfo, averages, pages } = data;

  // Helper to extract a specific metric's average
  const getAverage = (metricName: string) => {
    const metric = averages.find((m) => m.name === metricName);
    return metric ? Number(metric.average.toFixed(2)) : 0;
  };

  const statCards = [
    {
      label: "Average LCP",
      value: `${getAverage("LCP")} ms`,
      subtext: getAverage("LCP") <= 2500 ? "Good" : "Needs Improvement",
      icon: Zap,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Average INP",
      value: `${getAverage("INP")} ms`,
      subtext: getAverage("INP") <= 200 ? "Good" : "Needs Improvement",
      icon: MousePointer,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Average CLS",
      value: getAverage("CLS").toString(),
      subtext: getAverage("CLS") <= 0.1 ? "Good" : "Needs Improvement",
      icon: Activity,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Average TTFB",
      value: `${getAverage("TTFB")} ms`,
      subtext: getAverage("TTFB") <= 800 ? "Good" : "Needs Improvement",
      icon: Clock,
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="mb-4">
        <Link
          href="/admin/performance"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Performance
        </Link>
      </div>

      <PageHeader
        title="Visitor Performance Details"
        description={`Performance metrics tracked for visitor: ${visitorId}`}
      />

      {/* Visitor Info */}
      <section className="bg-dark/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            {visitorInfo?.userId?.avatar ? (
              <img
                src={visitorInfo.userId.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {visitorInfo?.userId
                ? visitorInfo.userId.name
                : "Anonymous Visitor"}
            </h3>
            {visitorInfo?.userId?.email && (
              <p className="text-sm text-gray-400">
                {visitorInfo.userId.email}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1 font-mono">
              ID: {visitorId}
            </p>
          </div>
        </div>
      </section>

      {/* Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Page Metrics */}
      <section aria-label="Page Metrics">
        <div className="glass rounded-xl overflow-hidden border-white/5 border">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-white">Every Page Metrics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date / Time
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Path
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    LCP
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    INP
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    CLS
                  </th>
                  <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    TTFB
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pages.map((page, idx) => {
                  const getMetric = (name: string) =>
                    page.metrics.find((m) => m.name === name);
                  const lcp = getMetric("LCP");
                  const inp = getMetric("INP");
                  const cls = getMetric("CLS");
                  const ttfb = getMetric("TTFB");

                  const getRatingColor = (rating: string | undefined) => {
                    if (rating === "good") return "text-emerald-400";
                    if (rating === "needs-improvement") return "text-amber-400";
                    if (rating === "poor") return "text-red-400";
                    return "text-gray-400";
                  };

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4 text-sm text-gray-300">
                        {new Date(page.createdAt).toLocaleString()}
                      </td>
                      <td
                        className="p-4 text-sm font-medium text-white truncate max-w-[200px]"
                        title={page.path}
                      >
                        {page.path}
                      </td>
                      <td
                        className={`p-4 text-sm font-medium ${getRatingColor(lcp?.rating)}`}
                      >
                        {lcp ? `${lcp.value.toFixed(0)} ms` : "-"}
                      </td>
                      <td
                        className={`p-4 text-sm font-medium ${getRatingColor(inp?.rating)}`}
                      >
                        {inp ? `${inp.value.toFixed(0)} ms` : "-"}
                      </td>
                      <td
                        className={`p-4 text-sm font-medium ${getRatingColor(cls?.rating)}`}
                      >
                        {cls ? cls.value.toFixed(3) : "-"}
                      </td>
                      <td
                        className={`p-4 text-sm font-medium ${getRatingColor(ttfb?.rating)}`}
                      >
                        {ttfb ? `${ttfb.value.toFixed(0)} ms` : "-"}
                      </td>
                    </tr>
                  );
                })}
                {pages.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No page metrics found.
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

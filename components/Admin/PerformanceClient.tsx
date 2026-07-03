"use client";

import React, { useMemo } from "react";
import StatCard from "@/components/Dashboard/shared/StatCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import ChartCard, { ChartDataPoint } from "@/components/Dashboard/shared/ChartCard";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { MousePointer } from "@/components/ui/svgs/icons/MousePointer";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Activity } from "@/components/ui/svgs/icons/Activity";

interface PerformanceClientProps {
  data: {
    globalAverages: { _id: string; average: number; count: number }[];
    ratingDistributions: {
      _id: string;
      ratings: { rating: string; count: number }[];
      total: number;
    }[];
    dailyTrends: Record<string, { date: string; value: number }[]>;
    slowestPages: { _id: string; averageLCP: number; count: number }[];
  } | null;
}

export default function PerformanceClient({ data }: PerformanceClientProps) {
  if (!data) {
    return (
      <div className="p-6">
        <PageHeader
          title="Web Vitals"
          description="Could not load performance data."
        />
      </div>
    );
  }

  const { globalAverages, ratingDistributions, dailyTrends, slowestPages } = data;

  // Helper to extract a specific metric's average
  const getAverage = (metricName: string) => {
    const metric = globalAverages.find((m) => m._id === metricName);
    return metric ? Number(metric.average.toFixed(2)) : 0;
  };

  const statCards = [
    {
      label: "Average LCP",
      value: `${getAverage("LCP")} ms`,
      subtext: getAverage("LCP") <= 2500 ? "Good" : "Needs Improvement",
      icon: Zap,
      gradient: "from-blue-500 to-cyan-500",
      trend: { value: 0, isPositive: true }, // Add real trends if we add historical data
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

  // Convert string dates to Date objects for charts
  const formatChartData = (metricName: string): ChartDataPoint[] => {
    const rawData = dailyTrends[metricName] || [];
    return rawData.map((d) => ({
      date: new Date(d.date),
      value: d.value,
    }));
  };

  const lcpData = useMemo(() => formatChartData("LCP"), [dailyTrends]);
  const inpData = useMemo(() => formatChartData("INP"), [dailyTrends]);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageHeader
        title="Performance Analytics"
        description="Monitor real-world Web Vitals from your users over the last 30 days."
      />

      {/* Global Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="LCP Trend (Last 30 Days)"
          data={lcpData}
          type="area"
          gradient="from-blue-500 to-cyan-500"
        />
        <ChartCard
          title="INP Trend (Last 30 Days)"
          data={inpData}
          type="line"
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Lower Section: Distributions and Slowest Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rating Distributions */}
        <div className="lg:col-span-1 bg-dark/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Rating Distributions</h3>
          <div className="space-y-6">
            {ratingDistributions.map((dist) => {
              const good = dist.ratings.find(r => r.rating === "good")?.count || 0;
              const needsImprovement = dist.ratings.find(r => r.rating === "needs-improvement")?.count || 0;
              const poor = dist.ratings.find(r => r.rating === "poor")?.count || 0;

              const goodPct = (good / dist.total) * 100;
              const niPct = (needsImprovement / dist.total) * 100;
              const poorPct = (poor / dist.total) * 100;

              return (
                <div key={dist._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-200">{dist._id}</span>
                    <span className="text-gray-400">{dist.total} samples</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full flex overflow-hidden">
                    <div style={{ width: `${goodPct}%` }} className="bg-emerald-500 h-full" title={`Good: ${goodPct.toFixed(1)}%`} />
                    <div style={{ width: `${niPct}%` }} className="bg-amber-500 h-full" title={`Needs Improvement: ${niPct.toFixed(1)}%`} />
                    <div style={{ width: `${poorPct}%` }} className="bg-red-500 h-full" title={`Poor: ${poorPct.toFixed(1)}%`} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{goodPct.toFixed(0)}% Good</span>
                    <span>{poorPct.toFixed(0)}% Poor</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slowest Pages */}
        <div className="lg:col-span-2 bg-dark/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Slowest Pages (by LCP)</h3>
          {slowestPages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Path</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Average LCP</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Sample Size</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slowestPages.map((page, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-200 font-mono">{page._id}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{page.averageLCP.toFixed(0)} ms</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{page.count}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          page.averageLCP <= 2500 ? 'bg-emerald-500/10 text-emerald-400' :
                          page.averageLCP <= 4000 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {page.averageLCP <= 2500 ? 'Good' : page.averageLCP <= 4000 ? 'Needs Improvement' : 'Poor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400">
              No slow pages detected.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

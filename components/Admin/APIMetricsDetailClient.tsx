"use client";

import React from "react";
import Link from "next/link";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import StatCard from "@/components/Dashboard/shared/StatCard";
import ChartCard, { ChartDataPoint } from "@/components/Dashboard/shared/ChartCard";
import { Activity } from "@/components/ui/svgs/icons/Activity";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { ArrowLeft } from "@/components/ui/svgs/icons/ArrowLeft";

interface APIMetricsDetailClientProps {
  data: {
    route: string;
    method: string;
    avgDuration: number;
    totalRequests: number;
    errorCount: number;
    cacheHitCount: number;
    errorRate: number;
    cacheHitRate: number;
    lastUpdated: string;
    statusDistribution: { status: string; count: number }[];
    cacheBreakdown: { hits: number; misses: number };
    latencyTrend: { date: string; avgDuration: number; requestCount: number }[];
    recentTraces: {
      duration: number;
      statusCode: number;
      cacheHit?: boolean;
      rateLimited?: boolean;
      timestamp: string;
    }[];
  } | null;
  routeParam?: string;
}

export default function APIMetricsDetailClient({ data, routeParam }: APIMetricsDetailClientProps) {
  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Link
          href="/admin/api-metrics"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to API Metrics
        </Link>
        <PageHeader
          title="Route Performance Detail"
          description={`Could not find performance metrics for ${routeParam || "specified route"}.`}
        />
      </div>
    );
  }

  const {
    route,
    method,
    avgDuration,
    totalRequests,
    errorCount,
    errorRate,
    cacheHitRate,
    lastUpdated,
    statusDistribution = [],
    cacheBreakdown = { hits: 0, misses: 0 },
    latencyTrend = [],
    recentTraces = [],
  } = data;

  const chartData: ChartDataPoint[] = latencyTrend.map((t) => ({
    date: new Date(t.date),
    value: t.avgDuration,
  }));

  const getMethodBadgeClass = (m: string) => {
    switch (m.toUpperCase()) {
      case "GET":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "POST":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "PATCH":
      case "PUT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusBadgeClass = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (statusCode >= 400 && statusCode < 500) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  };

  const statCards = [
    {
      label: "Total Requests",
      value: totalRequests.toLocaleString(),
      subtext: "Tracked executions",
      icon: Activity,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Avg Latency",
      value: `${avgDuration} ms`,
      subtext: avgDuration < 200 ? "Optimal performance" : "Requires tuning",
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Error Rate",
      value: `${errorRate}%`,
      subtext: `${errorCount} total error responses`,
      icon: AlertCircle,
      gradient: errorRate < 2 ? "from-emerald-500 to-teal-500" : "from-rose-500 to-red-500",
    },
    {
      label: "Cache Hit Rate",
      value: `${cacheHitRate}%`,
      subtext: `${cacheBreakdown.hits} hits / ${cacheBreakdown.misses} misses`,
      icon: Zap,
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/admin/api-metrics"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to API Metrics
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold border ${getMethodBadgeClass(
                method
              )}`}
            >
              {method}
            </span>
            <h1 className="text-2xl font-bold text-white font-mono">{route}</h1>
          </div>
          <p className="text-sm text-gray-400">
            Route performance details, HTTP status code distribution, and latency trace log.
          </p>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Last active: {new Date(lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <StatCard
            key={idx}
            label={card.label}
            value={card.value}
            subtext={card.subtext}
            icon={card.icon}
            gradient={card.gradient}
          />
        ))}
      </div>

      {/* Latency Trend Chart */}
      {latencyTrend.length > 0 && (
        <ChartCard
          title="Latency Trend (ms)"
          subtitle="Average response time over the last 30 days"
          data={chartData}
          unit="ms"
        />
      )}

      {/* Distribution & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Codes */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">HTTP Status Distribution</h3>
          <div className="space-y-3">
            {statusDistribution.map((item) => {
              const statusNum = parseInt(item.status, 10);
              const pct = Math.round((item.count / totalRequests) * 100);
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getStatusBadgeClass(
                        statusNum
                      )}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-gray-300 font-mono text-xs">
                      {item.count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        statusNum < 400 ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cache Efficiency */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Cache Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-300">Cache HITs</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                {cacheBreakdown.hits.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-300">Cache MISSes</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {cacheBreakdown.misses.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Request Traces */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Recent Request Trace Logs</h3>
          <p className="text-xs text-gray-400">Latest execution logs captured in Redis buffer.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-6 text-start">Timestamp</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Duration</th>
                <th className="py-3 px-6 text-center">Cache</th>
                <th className="py-3 px-6 text-center">Rate Limited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {recentTraces.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No recent request trace logs.
                  </td>
                </tr>
              ) : (
                recentTraces.map((trace, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-6 text-gray-400">
                      {new Date(trace.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold border ${getStatusBadgeClass(
                          trace.statusCode
                        )}`}
                      >
                        {trace.statusCode}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center text-white">
                      {trace.duration} ms
                    </td>
                    <td className="py-3 px-6 text-center">
                      {trace.cacheHit ? (
                        <span className="text-emerald-400 font-semibold">HIT</span>
                      ) : (
                        <span className="text-gray-500">MISS</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-center">
                      {trace.rateLimited ? (
                        <span className="text-rose-400 font-bold">YES</span>
                      ) : (
                        <span className="text-gray-500">NO</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

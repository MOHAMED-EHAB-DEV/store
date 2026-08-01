"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import StatCard from "@/components/Dashboard/shared/StatCard";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Activity } from "@/components/ui/svgs/icons/Activity";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Zap } from "@/components/ui/svgs/icons/Zap";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { Search } from "@/components/ui/svgs/icons/Search";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface APIMetricsClientProps {
  data: {
    globalStats: {
      totalRequests: number;
      avgDuration: number;
      errorRate: number;
      cacheHitRate: number;
      routeCount: number;
    };
    items: {
      _id: string;
      route: string;
      method: string;
      avgDuration: number;
      totalRequests: number;
      errorCount: number;
      cacheHitCount: number;
      lastUpdated: string;
    }[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  } | null;
}

export default function APIMetricsClient({ data }: APIMetricsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const currentMethod = searchParams.get("method") || "ALL";
  const currentSort = searchParams.get("sortBy") || "avgDuration";

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="API Metrics & Monitoring"
          description="Could not load API performance data."
        />
        <EmptyState
          title="Failed to load metrics"
          description="Please try refreshing the page or contact the platform administrator."
        />
      </div>
    );
  }

  const { globalStats, items = [], pagination } = data;

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== "ALL") {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    params.set("page", "1");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
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

  const getLatencyBadgeClass = (duration: number) => {
    if (duration < 150) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
    if (duration < 500) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
    return "bg-rose-500/10 text-rose-400 border-rose-500/30";
  };

  const statCards = [
    {
      label: "Total Requests",
      value: globalStats.totalRequests.toLocaleString(),
      subtext: `${globalStats.routeCount} API routes tracked`,
      icon: Activity,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Avg Response Time",
      value: `${globalStats.avgDuration} ms`,
      subtext: globalStats.avgDuration < 200 ? "Optimal performance" : "Requires attention",
      icon: Clock,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Global Error Rate",
      value: `${globalStats.errorRate}%`,
      subtext: globalStats.errorRate < 2 ? "Healthy status" : "High error rate",
      icon: AlertCircle,
      gradient: globalStats.errorRate < 2 ? "from-emerald-500 to-teal-500" : "from-rose-500 to-red-500",
    },
    {
      label: "Cache Hit Rate",
      value: `${globalStats.cacheHitRate}%`,
      subtext: "Global MAP caching efficiency",
      icon: Zap,
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <PageHeader
        title="API Metrics & Monitoring"
        description="Real-time performance stats, latency distribution, and route monitoring powered by In-Memory MAPS."
      />

      {/* Overview Cards */}
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

      {/* Filter and Control Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search route path (e.g. /api/templates)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              isClearable
              onClear={() => {
                setSearch("");
                updateFilters({ search: "" });
              }}
            />
          </form>

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Select */}
            <Select
              placeholder="Sort by"
              selectedKeys={[currentSort]}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              className="w-48"
            >
              <SelectItem value="avgDuration">Slowest Latency</SelectItem>
              <SelectItem value="totalRequests">Most Requests</SelectItem>
              <SelectItem value="errorCount">Highest Errors</SelectItem>
              <SelectItem value="lastUpdated">Recently Active</SelectItem>
            </Select>
          </div>
        </div>

        {/* Method Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "GET", "POST", "PATCH", "DELETE"].map((m) => (
            <Button
              key={m}
              variant={currentMethod === m ? "gradient-primary" : "outline"}
              size="xs"
              onClick={() => updateFilters({ method: m })}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* Routes Table */}
      <div
        className={cn(
          "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-opacity duration-200",
          isPending && "opacity-50 pointer-events-none"
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6 text-start">Method & Route</th>
                <th className="py-4 px-6 text-start">Avg Latency</th>
                <th className="py-4 px-6 text-center">Requests</th>
                <th className="py-4 px-6 text-center">Errors</th>
                <th className="py-4 px-6 text-center">Cache Hit %</th>
                <th className="py-4 px-6 text-end">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      title="No API route metrics found"
                      description="Could not find any routes matching your current search and filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const cacheHitPct =
                    item.totalRequests > 0
                      ? Math.round((item.cacheHitCount / item.totalRequests) * 100)
                      : 0;

                  return (
                    <tr
                      key={item._id}
                      onClick={() =>
                        startTransition(() => {
                          router.push(
                            `/admin/api-metrics/detail?route=${encodeURIComponent(item.route)}&method=${item.method}`
                          );
                        })
                      }
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      {/* Method & Route */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={getMethodBadgeClass(item.method)}
                          >
                            {item.method}
                          </Badge>
                          <span className="font-mono text-white group-hover:text-blue-400 transition-colors font-medium">
                            {item.route}
                          </span>
                        </div>
                      </td>

                      {/* Latency */}
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={cn("rounded-full font-mono", getLatencyBadgeClass(item.avgDuration))}
                        >
                          {item.avgDuration} ms
                        </Badge>
                      </td>

                      {/* Total Requests */}
                      <td className="py-4 px-6 text-center font-medium text-white">
                        {item.totalRequests.toLocaleString()}
                      </td>

                      {/* Error Count */}
                      <td className="py-4 px-6 text-center">
                        {item.errorCount > 0 ? (
                          <Badge variant="destructive" className="rounded-full">
                            {item.errorCount}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-xs">0</span>
                        )}
                      </td>

                      {/* Cache Hit % */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-400 h-full rounded-full"
                              style={{ width: `${cacheHitPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-300 font-mono">
                            {cacheHitPct}%
                          </span>
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-4 px-6 text-end text-xs text-gray-400 font-mono">
                        {new Date(item.lastUpdated).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-center">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}



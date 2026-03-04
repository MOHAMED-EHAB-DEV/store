"use client";

import { useEffect, useState, useCallback } from "react";
import { useAnalytics } from "@/context/AnalyticsContext";

export interface AnalyticsStats {
  totalVisitors: number;
  uniqueLast24h: number;
  uniqueLast7d: number;
  uniqueLast30d: number;
  topPages: { path: string; count: number }[];
  dailyVisits: { date: string; count: number }[];
}

interface UseAnalyticsStatsResult {
  stats: AnalyticsStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalyticsStats(): UseAnalyticsStatsResult {
  const { onlineCount } = useAnalytics();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analytics/stats");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const data = await res.json();
      if (data.success) setStats(data.data);
      else throw new Error(data.error ?? "Unknown error");
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats: stats
      ? {
          ...stats,
          // Inject live online count from socket
          uniqueLast24h: Math.max(stats.uniqueLast24h, onlineCount),
        }
      : null,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

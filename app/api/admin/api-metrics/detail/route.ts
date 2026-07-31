import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import APIMetrics from "@/lib/models/APIMetrics";
import { authenticateUser } from "@/lib/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getAPIMetricDetail(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { searchParams } = new URL(req.url);
    const route = searchParams.get("route");
    const method = (searchParams.get("method") || "GET").toUpperCase();

    if (!route) {
      return createErrorResponse("Route parameter is required", 400, { req });
    }

    const doc = await APIMetrics.findOne({ route, method }).lean();

    if (!doc) {
      return createErrorResponse(`No performance metrics found for ${method} ${route}`, 404, { req });
    }

    const metrics = doc.metrics || [];

    // 1. Status Code Distribution
    const statusCounts: Record<string, number> = {};
    let cacheHits = 0;
    let cacheMisses = 0;

    metrics.forEach((m) => {
      const status = m.statusCode ? m.statusCode.toString() : "200";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      if (m.cacheHit) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    });

    const statusDistribution = Object.keys(statusCounts).map((status) => ({
      status,
      count: statusCounts[status],
    }));

    // 2. Group latency by day for trend chart
    const dailyLatencyMap = new Map<string, { sum: number; count: number }>();

    metrics.forEach((m) => {
      if (!m.timestamp) return;
      const dateStr = new Date(m.timestamp).toISOString().split("T")[0];
      if (!dailyLatencyMap.has(dateStr)) {
        dailyLatencyMap.set(dateStr, { sum: 0, count: 0 });
      }
      const item = dailyLatencyMap.get(dateStr)!;
      item.sum += m.duration;
      item.count += 1;
    });

    const latencyTrend = Array.from(dailyLatencyMap.entries())
      .map(([date, data]) => ({
        date,
        avgDuration: Math.round(data.sum / data.count),
        requestCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Recent 50 traces (newest first)
    const recentTraces = [...metrics]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    const errorRate =
      doc.totalRequests > 0
        ? Number(((doc.errorCount / doc.totalRequests) * 100).toFixed(2))
        : 0;
    const cacheHitRate =
      doc.totalRequests > 0
        ? Number(((doc.cacheHitCount / doc.totalRequests) * 100).toFixed(2))
        : 0;

    return createAPIResponse({
      route: doc.route,
      method: doc.method,
      avgDuration: doc.avgDuration,
      totalRequests: doc.totalRequests,
      errorCount: doc.errorCount,
      cacheHitCount: doc.cacheHitCount,
      errorRate,
      cacheHitRate,
      lastUpdated: doc.lastUpdated,
      statusDistribution,
      cacheBreakdown: { hits: cacheHits, misses: cacheMisses },
      latencyTrend,
      recentTraces,
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Failed to fetch route detail metrics", 500, {
      req,
      error,
      operation: "getAPIMetricDetail",
    });
  }
}

export const GET = withAPIMiddleware(getAPIMetricDetail);

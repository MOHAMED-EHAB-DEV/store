import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import APIMetrics from "@/lib/models/APIMetrics";
import { authenticateUser } from "@/lib/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function getAPIMetricsStats(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const method = searchParams.get("method") || "ALL";
    const sortBy = searchParams.get("sortBy") || "avgDuration";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filter query
    const query: any = {};
    if (search) {
      query.route = { $regex: search, $options: "i" };
    }
    if (method && method !== "ALL") {
      query.method = method.toUpperCase();
    }

    // Sort query
    let sort: any = { avgDuration: -1 };
    if (sortBy === "totalRequests") sort = { totalRequests: -1 };
    if (sortBy === "errorCount") sort = { errorCount: -1 };
    if (sortBy === "cacheHitCount") sort = { cacheHitCount: -1 };
    if (sortBy === "lastUpdated") sort = { lastUpdated: -1 };

    // Execute queries in parallel
    const [globalAgg, items, totalItems] = await Promise.all([
      APIMetrics.aggregate([
        {
          $group: {
            _id: null,
            totalRequests: { $sum: "$totalRequests" },
            totalErrors: { $sum: "$errorCount" },
            totalHits: { $sum: "$cacheHitCount" },
            sumDurationTimesRequests: { $sum: { $multiply: ["$avgDuration", "$totalRequests"] } },
            routeCount: { $sum: 1 },
          },
        },
      ]),
      APIMetrics.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-metrics") // Omit heavy metrics array for list view
        .lean(),
      APIMetrics.countDocuments(query),
    ]);

    const globalResult = globalAgg[0] || {
      totalRequests: 0,
      totalErrors: 0,
      totalHits: 0,
      sumDurationTimesRequests: 0,
      routeCount: 0,
    };

    const totalRequests = globalResult.totalRequests;
    const avgDuration =
      totalRequests > 0
        ? Math.round(globalResult.sumDurationTimesRequests / totalRequests)
        : 0;
    const errorRate =
      totalRequests > 0
        ? Number(((globalResult.totalErrors / totalRequests) * 100).toFixed(2))
        : 0;
    const cacheHitRate =
      totalRequests > 0
        ? Number(((globalResult.totalHits / totalRequests) * 100).toFixed(2))
        : 0;

    return createAPIResponse({
      globalStats: {
        totalRequests,
        avgDuration,
        errorRate,
        cacheHitRate,
        routeCount: globalResult.routeCount,
      },
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Failed to fetch API metrics", 500, {
      req,
      error,
      operation: "getAPIMetricsStats",
    });
  }
}

export const GET = withAPIMiddleware(getAPIMetricsStats);

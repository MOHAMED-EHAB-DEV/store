import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import APIMetrics from "@/lib/models/APIMetrics";
import { redis } from "@/lib/redis";
import { createAPIResponse, createErrorResponse } from "@/lib/utils/api-helpers";
import { Receiver } from "@upstash/qstash";

const receiver = process.env.QSTASH_CURRENT_SIGNING_KEY
  ? new Receiver({
      currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
    })
  : null;

async function verifyAuth(req: NextRequest, bodyText: string): Promise<boolean> {
  const secretParam = req.nextUrl.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secretParam === expectedSecret) {
    return true;
  }

  if (expectedSecret && authHeader === `Bearer ${expectedSecret}`) {
    return true;
  }

  const signature = req.headers.get("upstash-signature");
  if (receiver && signature) {
    try {
      const isValid = await receiver.verify({ signature, body: bodyText });
      if (isValid) return true;
    } catch {
      // Fallback
    }
  }

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const isAuthorized = await verifyAuth(req, bodyText);
    if (!isAuthorized) {
      return createErrorResponse("Unauthorized cron request", 401);
    }

    // Atomically move items to processing key
    const tempKey = `metrics:api:proc:${Date.now()}`;
    const renamed = await redis.rename("metrics:api:buffer", tempKey).catch(() => null);
    if (!renamed) {
      return createAPIResponse({ processed: 0, message: "Buffer empty" });
    }

    const rawItems = await redis.lrange(tempKey, 0, -1);
    await redis.del(tempKey);

    if (!rawItems || rawItems.length === 0) {
      return createAPIResponse({ processed: 0, message: "No items to flush" });
    }

    // Group metrics by route + method
    const routeMap = new Map<
      string,
      {
        route: string;
        method: string;
        entries: {
          duration: number;
          statusCode: number;
          cacheHit: boolean;
          rateLimited: boolean;
          timestamp: Date;
        }[];
      }
    >();

    for (const rawItem of rawItems) {
      try {
        const item = typeof rawItem === "string" ? JSON.parse(rawItem) : rawItem;
        const { route, method, duration, statusCode, cacheHit, rateLimited, timestamp } = item;

        if (!route || !method || duration === undefined) continue;

        const key = `${method}:${route}`;
        if (!routeMap.has(key)) {
          routeMap.set(key, { route, method, entries: [] });
        }

        routeMap.get(key)!.entries.push({
          duration,
          statusCode: statusCode || 200,
          cacheHit: !!cacheHit,
          rateLimited: !!rateLimited,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
        });
      } catch (parseErr) {
        console.error("Error parsing API metric item:", parseErr);
      }
    }

    if (routeMap.size === 0) {
      return createAPIResponse({ processed: 0, message: "No valid API metrics parsed" });
    }

    await connectToDatabase();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let routesUpdated = 0;

    for (const { route, method, entries } of routeMap.values()) {
      let doc = await APIMetrics.findOne({ route, method });

      if (!doc) {
        doc = new APIMetrics({
          route,
          method,
          metrics: [],
          avgDuration: 0,
          totalRequests: 0,
          errorCount: 0,
          cacheHitCount: 0,
          lastUpdated: new Date(),
        });
      }

      // Combine existing metrics + new entries, filter out > 30 days old
      const combined = [...doc.metrics, ...entries].filter(
        (m) => new Date(m.timestamp) >= thirtyDaysAgo
      );

      // Keep max 500 latest entries
      const slicedMetrics = combined.slice(-500);

      // Recalculate aggregates
      const totalReq = slicedMetrics.length;
      const sumDur = slicedMetrics.reduce((sum, m) => sum + m.duration, 0);
      const errors = slicedMetrics.filter((m) => m.statusCode >= 400).length;
      const hits = slicedMetrics.filter((m) => m.cacheHit).length;

      doc.metrics = slicedMetrics;
      doc.totalRequests = totalReq;
      doc.avgDuration = totalReq > 0 ? Math.round(sumDur / totalReq) : 0;
      doc.errorCount = errors;
      doc.cacheHitCount = hits;
      doc.lastUpdated = new Date();

      await doc.save();
      routesUpdated++;
    }

    return createAPIResponse({
      processed: rawItems.length,
      routesUpdated,
    });
  } catch (error: any) {
    console.error("Error in flush-metrics cron:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

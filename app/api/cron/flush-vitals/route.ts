import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics, { IWebVitalMetric } from "@/lib/models/Analytics";
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
    const tempKey = `analytics:vitals:proc:${Date.now()}`;
    const renamed = await redis.rename("analytics:vitals:buffer", tempKey).catch(() => null);
    if (!renamed) {
      return createAPIResponse({ processed: 0, message: "Buffer empty" });
    }

    const rawItems = await redis.lrange(tempKey, 0, -1);
    await redis.del(tempKey);

    if (!rawItems || rawItems.length === 0) {
      return createAPIResponse({ processed: 0, message: "No items to flush" });
    }

    // Group items by visitorId -> path -> metric.name
    const visitorMap = new Map<string, Map<string, Map<string, IWebVitalMetric>>>();

    for (const rawItem of rawItems) {
      try {
        const item = typeof rawItem === "string" ? JSON.parse(rawItem) : rawItem;
        const { visitorId, path, metrics } = item;

        if (!visitorId || !path || !Array.isArray(metrics)) continue;

        if (!visitorMap.has(visitorId)) {
          visitorMap.set(visitorId, new Map());
        }
        const pagesMap = visitorMap.get(visitorId)!;

        if (!pagesMap.has(path)) {
          pagesMap.set(path, new Map());
        }
        const metricsMap = pagesMap.get(path)!;

        for (const m of metrics) {
          if (!m.name || m.value === undefined) continue;
          metricsMap.set(m.name, {
            name: m.name,
            value: m.value,
            rating: m.rating || "good",
            delta: m.delta || 0,
            updatedAt: new Date(),
          });
        }
      } catch (parseErr) {
        console.error("Error parsing vitals item:", parseErr);
      }
    }

    if (visitorMap.size === 0) {
      return createAPIResponse({ processed: 0, message: "No valid vitals parsed" });
    }

    await connectToDatabase();

    let updatedDocsCount = 0;

    for (const [visitorId, pagesMap] of visitorMap.entries()) {
      let doc = await Analytics.findOne({ visitorId });

      if (!doc) {
        doc = new Analytics({ visitorId, pages: [] });
      }

      for (const [path, newMetricsMap] of pagesMap.entries()) {
        let page = doc.pages.find((p) => p.path === path);
        if (!page) {
          page = { path, metrics: [] };
          doc.pages.push(page);
        }

        // Update or append metric per name (max 5 metrics: LCP, INP, CLS, TTFB, FCP)
        for (const [metricName, newMetric] of newMetricsMap.entries()) {
          const existingMetricIndex = page.metrics.findIndex((m) => m.name === metricName);
          if (existingMetricIndex >= 0) {
            page.metrics[existingMetricIndex] = newMetric;
          } else {
            page.metrics.push(newMetric);
          }
        }

        // Enforce max 5 metrics per page
        if (page.metrics.length > 5) {
          page.metrics = page.metrics.slice(-5);
        }
      }

      await doc.save();
      updatedDocsCount++;
    }

    return createAPIResponse({
      processed: rawItems.length,
      visitorsUpdated: updatedDocsCount,
    });
  } catch (error: any) {
    console.error("Error in flush-vitals cron:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

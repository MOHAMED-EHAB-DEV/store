import { after, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics from "@/lib/models/Analytics";
import { createErrorResponse, createAPIResponse } from "@/lib/utils/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, metrics, visitorId } = body;

    if (!path || !metrics || !Array.isArray(metrics)) {
      return createErrorResponse("Invalid payload", 400);
    }

    if (!visitorId) {
      return createErrorResponse("No visitor ID found", 401);
    }

    // Clean metrics
    const cleanMetrics = metrics.map((m: any) => ({
      name: m.name,
      value: m.value,
      rating: m.rating || "good",
      delta: m.delta || 0,
      updatedAt: new Date(),
    }));

    // Immediate MongoDB write after returning response
    after(async () => {
      try {
        await connectToDatabase();
        let doc = await Analytics.findOne({ visitorId });
        if (!doc) {
          doc = new Analytics({ visitorId, pages: [] });
        }

        let page = doc.pages.find((p) => p.path === path);
        if (!page) {
          page = { path, metrics: [] };
          doc.pages.push(page);
        }

        for (const newMetric of cleanMetrics) {
          if (!newMetric.name || newMetric.value === undefined) continue;
          const existingIndex = page.metrics.findIndex((m) => m.name === newMetric.name);
          if (existingIndex >= 0) {
            page.metrics[existingIndex] = newMetric;
          } else {
            page.metrics.push(newMetric);
          }
        }

        if (page.metrics.length > 5) {
          page.metrics = page.metrics.slice(-5);
        }

        await doc.save();
      } catch (err) {
        console.error("[Analytics] vitals DB write error:", err);
      }
    });

    return createAPIResponse({ success: true }, { message: "Metrics enqueued" });
  } catch (error) {
    console.error("Error parsing vitals request:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

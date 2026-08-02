import { after, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics from "@/lib/models/Analytics";
import {
  createErrorResponse,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

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

        // Ensure parent document exists
        await Analytics.updateOne(
          { visitorId },
          { $setOnInsert: { visitorId, pages: [] } },
          { upsert: true },
        );

        for (const newMetric of cleanMetrics) {
          if (!newMetric.name || newMetric.value === undefined) continue;

          // 1. Try to update existing metric in matching page
          const updateResult = await Analytics.updateOne(
            {
              visitorId,
              "pages.path": path,
              "pages.metrics.name": newMetric.name,
            },
            {
              $set: {
                "pages.$[p].metrics.$[m]": newMetric,
              },
            },
            {
              arrayFilters: [{ "p.path": path }, { "m.name": newMetric.name }],
            },
          );

          // 2. If metric didn't exist in page, push it to metrics array
          if (updateResult.matchedCount === 0) {
            const pagePushResult = await Analytics.updateOne(
              { visitorId, "pages.path": path },
              { $push: { "pages.$.metrics": newMetric } },
            );

            // 3. If page didn't exist, push new page with metric
            if (pagePushResult.matchedCount === 0) {
              await Analytics.updateOne(
                { visitorId },
                { $push: { pages: { path, metrics: [newMetric] } } },
              );
            }
          }
        }
      } catch (err) {
        console.error("[Analytics] vitals DB write error:", err);
      }
    });

    return createAPIResponse(
      { success: true },
      { message: "Metrics enqueued" },
    );
  } catch (error) {
    console.error("Error parsing vitals request:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

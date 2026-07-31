import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";
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
      rating: m.rating,
      delta: m.delta,
    }));

    // Buffer payload into Redis for QStash batch processing
    await redis.rpush(
      "analytics:vitals:buffer",
      JSON.stringify({
        visitorId,
        path,
        metrics: cleanMetrics,
      })
    );

    return createAPIResponse({ success: true }, { message: "Metrics enqueued" });
  } catch (error) {
    console.error("Error parsing vitals request:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

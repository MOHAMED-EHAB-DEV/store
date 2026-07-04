import { NextRequest } from "next/server";
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

    // Strip id from metrics if it was sent, to save space
    const cleanMetrics = metrics.map((m: any) => ({
      name: m.name,
      value: m.value,
      rating: m.rating,
      delta: m.delta
    }));

    await connectToDatabase();

    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Try to push metrics to an existing path for this visitor/date
    const doc = await Analytics.findOneAndUpdate(
      { visitorId, date, "pages.path": path },
      { $push: { "pages.$.metrics": { $each: cleanMetrics } } },
      { new: true }
    );

    // 2. If no document was found (either new visitor/date, or new path), upsert the path
    if (!doc) {
      await Analytics.findOneAndUpdate(
        { visitorId, date },
        { $push: { pages: { path, metrics: cleanMetrics } } },
        { upsert: true, new: true }
      );
    }

    return createAPIResponse({ success: true }, { message: "Metrics recorded" });
  } catch (error) {
    console.error("Error saving vitals:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

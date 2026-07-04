import { NextRequest, NextResponse } from "next/server";
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
      // If no visitorId, we could skip saving or assign a generic one
      return createErrorResponse("No visitor ID found", 401);
    }

    await connectToDatabase();

    const analyticsRecord = new Analytics({
      visitorId,
      path,
      metrics,
    });

    await analyticsRecord.save();

    return createAPIResponse({ success: true }, { message: "Metrics recorded" });
  } catch (error) {
    console.error("Error saving vitals:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

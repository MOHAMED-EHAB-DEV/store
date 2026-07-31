import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createAPIResponse, createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";
import { verifyToken } from "@/lib/auth";
import { redis } from "@/lib/redis";

async function track(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, path } = body;

    if (!visitorId || typeof visitorId !== "string") {
      return createErrorResponse("visitorId is required", 400, {
        req,
        operation: "analyticsTrack",
      });
    }

    // Extract user ID from JWT cookie without hitting DB
    let userId: string | undefined;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        const decoded = await verifyToken(token);
        if (decoded?.userId) userId = decoded.userId;
      }
    } catch {
      // Ignore token verification errors
    }

    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Push tracking event to Redis buffer for QStash batch processing
    await redis.rpush(
      "analytics:track:buffer",
      JSON.stringify({
        visitorId,
        path: path ?? "/",
        userAgent,
        ipHash,
        userId,
        timestamp: new Date().toISOString(),
      })
    );

    return createAPIResponse({});
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[Analytics] track error:", error);
    return NextResponse.json({ success: false });
  }
}

export const POST = withAPIMiddleware(track);

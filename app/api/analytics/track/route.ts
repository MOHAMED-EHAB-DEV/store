import { after, NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { createAPIResponse, createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function track(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, path, userId } = body;
    const source = body.source === "portfolio" ? "portfolio" : "store";

    if (!visitorId || typeof visitorId !== "string") {
      return createErrorResponse("visitorId is required", 400, {
        req,
        operation: "analyticsTrack",
      });
    }

    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");
    const now = new Date();

    // Immediate MongoDB write after returning response
    after(async () => {
      try {
        await connectToDatabase();
        await Visitor.updateOne(
          { visitorId, source },
          {
            $set: {
              source,
              lastVisit: now,
              userAgent,
              ipHash,
              ...(userId && { userId }),
            },
            $setOnInsert: { firstVisit: now },
            $inc: { visitCount: 1 },
            $push: {
              pathHistory: {
                $each: [{ path: path ?? "/", timestamp: now }],
                $slice: -20,
              },
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("[Analytics] track DB write error:", err);
      }
    });

    return createAPIResponse({});
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("[Analytics] track error:", error);
    return NextResponse.json({ success: false });
  }
}

export const POST = withAPIMiddleware(track);

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, path } = body;

    if (!visitorId || typeof visitorId !== "string") {
      return NextResponse.json(
        { error: "visitorId is required" },
        { status: 400 },
      );
    }

    // Fire-and-forget DB update – keeps response ultra fast
    const dbWork = (async () => {
      await connectToDatabase();

      const userAgent = req.headers.get("user-agent") || "unknown";
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
      const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

      // Upsert: creates or updates in a single atomic DB call
      await Visitor.findOneAndUpdate(
        { visitorId },
        {
          $set: { lastVisit: new Date(), userAgent, ipHash },
          $inc: { visitCount: 1 },
          $push: {
            pathHistory: {
              $each: [{ path: path ?? "/", timestamp: new Date() }],
              $slice: -20, // Keep last 20 page views per visitor
            },
          },
        },
        { upsert: true },
      );
    })();

    // Don't await – respond immediately and let DB write happen in background
    dbWork.catch((err) => console.error("[Analytics] DB error:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    console.error("[Analytics] track error:", error);
    // Always return 200 – analytics must NEVER break the user experience
    return NextResponse.json({ success: false });
  }
}

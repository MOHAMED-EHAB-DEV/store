import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { getUserFromServer } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, stack, digest, route, visitorId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || undefined;
    const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "unknown";
    const user = await getUserFromServer({ headerToken: "" });

    const errorLog = new ErrorLog({
      message,
      stack,
      digest,
      route,
      method: "CLIENT",
      status: 0, // Client side unexpected error
      operation: "client-report",
      userId: user?._id || undefined,
      visitorId,
      userAgent,
      ip,
      timestamp: new Date(),
    });

    await errorLog.save();

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error in error-log API:", error);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}

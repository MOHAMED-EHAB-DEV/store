import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { getUserFromServer } from "@/lib/auth";
import { headers } from "next/headers";
import { handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function logError(req: NextRequest) {
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
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return handleApiError(error, req, { operation: "logClientError" });
  }
}

export const POST = withAPIMiddleware(logError);


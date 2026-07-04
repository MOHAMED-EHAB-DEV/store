import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics from "@/lib/models/Analytics";
import { createErrorResponse, createAPIResponse } from "@/lib/utils/api-helpers";

export async function POST(req: NextRequest) {
  try {
    // Basic security: require a secret token
    // For Vercel/GitHub Actions: set CRON_SECRET in environment variables
    const secret = req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return createErrorResponse("Unauthorized", 401);
    }

    await connectToDatabase();

    // 1. Delete analytics records older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Since we store date as YYYY-MM-DD string, we can compare strings lexicographically
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const result = await Analytics.deleteMany({
      date: { $lt: thirtyDaysAgoStr }
    });

    return createAPIResponse({
      success: true,
      analyticsDeleted: result.deletedCount
    }, { message: "Cron job completed successfully" });

  } catch (error) {
    console.error("Cron job error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

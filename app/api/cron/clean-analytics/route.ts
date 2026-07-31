import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Analytics from "@/lib/models/Analytics";
import { createErrorResponse, createAPIResponse } from "@/lib/utils/api-helpers";

async function handleCron(req: NextRequest) {
  try {
    const secretParam = req.nextUrl.searchParams.get("secret");
    const authHeader = req.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    const isSecretValid =
      (expectedSecret && secretParam === expectedSecret) ||
      (expectedSecret && authHeader === `Bearer ${expectedSecret}`) ||
      process.env.NODE_ENV === "development";

    if (!isSecretValid) {
      return createErrorResponse("Unauthorized cron request", 401);
    }

    await connectToDatabase();

    // Delete analytics records inactive/older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await Analytics.deleteMany({
      updatedAt: { $lt: thirtyDaysAgo },
    });

    return createAPIResponse(
      {
        success: true,
        analyticsDeleted: result.deletedCount,
      },
      { message: "Clean analytics cron job completed successfully" }
    );
  } catch (error) {
    console.error("Clean analytics cron job error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}
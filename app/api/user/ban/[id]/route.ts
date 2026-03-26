import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";
import {
  createErrorResponse,
  handleApiError,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

async function banUser(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await authenticateUser(true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { id } = await params;
    const body = await request.json();
    const { reason, notes, expiresAt } = body;

    await connectToDatabase();
    const dbUser = await User.findById(id);

    if (!dbUser) {
      return createErrorResponse("User not found", 404, { req: request });
    }

    // Generate unique ban ID
    const banId = Math.random().toString(36).substring(2, 15).toUpperCase();

    // Update user with ban and metadata
    dbUser.banned = true;
    dbUser.banId = banId;
    dbUser.banMetadata = {
      reason: reason || "Violation of Terms of Service",
      bannedAt: new Date(),
      bannedBy: user._id?.toString() || "",
      notes: notes || "",
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };

    await dbUser.save();

    return NextResponse.json({
      success: true,
      banId,
      message: "User banned successfully",
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return handleApiError(error, request, { operation: "banUser" });
  }
}

export const POST = withAPIMiddleware(banUser);

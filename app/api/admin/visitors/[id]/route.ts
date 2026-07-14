import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { authenticateUser } from "@/lib/auth";
import { createAPIResponse, createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";
import Analytics from "@/lib/models/Analytics";

async function getAdminVisitorDetails(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;

    await connectToDatabase();

    const visitor = await Visitor.findOne({ visitorId: id }).populate("userId", "name email avatar role createdAt").lean();

    if (!visitor) {
      return createErrorResponse("Visitor not found", 404, { req });
    }

    const analytics = await Analytics.find({ visitorId: id }).lean();

    return createAPIResponse({ visitor, analytics }, {
      message: "Visitor details fetched successfully",
    });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminGetVisitorDetails" });
  }
}

export const GET = withAPIMiddleware(getAdminVisitorDetails);


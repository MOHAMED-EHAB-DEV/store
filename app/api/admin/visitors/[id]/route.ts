import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Visitor from "@/lib/models/Visitor";
import { authenticateUser } from "@/middleware/auth";
import { createAPIResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

    const visitor = await Visitor.findOne({ visitorId: id }).lean();

    if (!visitor) {
      return NextResponse.json({ success: false, message: "Visitor not found" }, { status: 404 });
    }

    return createAPIResponse(visitor, {
      message: "Visitor details fetched successfully",
    });
  } catch (error) {
    return handleApiError(error, req, { operation: "adminGetVisitorDetails" });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Review from "@/lib/models/Review";
import {
  withAPIMiddleware,
  createErrorResponse,
} from "@/lib/utils/api-helpers";

async function getReviewStatus(req: NextRequest) {
  try {
    await connectToDatabase();
    const templateId = req.nextUrl.searchParams.get("templateId");
    const userId = req.nextUrl.searchParams.get("userId");

    if (!templateId || !userId) {
      return NextResponse.json(
        { error: "Missing templateId or userId" },
        { status: 400 },
      );
    }

    const existing = await Review.findOne({
      template: templateId,
      user: userId,
      isActive: true,
    });
    return NextResponse.json({ reviewed: !!existing });
  } catch (err: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "checkReviewStatus",
    });
  }
}

export const GET = withAPIMiddleware(getReviewStatus);

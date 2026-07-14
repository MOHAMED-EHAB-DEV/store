import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Review from "@/lib/models/Review";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function toggleHelpful(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(false, true);
    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const body = await req.json();
    const { reviewId } = body;

    if (!reviewId) {
      return createErrorResponse("Missing reviewId", 400, { req });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return createErrorResponse("Review not found", 404, { req });
    }

    const hasVotedIndex = review.helpfulVotes.findIndex((id: any) => id.toString() === user._id.toString());

    if (hasVotedIndex > -1) {
      // User already voted, so remove vote
      review.helpfulVotes.splice(hasVotedIndex, 1);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add vote
      review.helpfulVotes.push(user._id as any);
      review.helpfulCount += 1;
    }

    await review.save();

    return NextResponse.json({
      success: true,
      helpfulCount: review.helpfulCount,
      hasVoted: hasVotedIndex === -1, // true if they just added it
    });
  } catch (err: any) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "toggleHelpfulReview",
    });
  }
}

export const POST = withAPIMiddleware(toggleHelpful);

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Review from "@/lib/models/Review";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import revalidate from "@/actions/revalidateTag";

async function getReviews(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get("templateId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "6", 10);

    if (!templateId) {
      return createErrorResponse("templateId required", 400, { req });
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.findTemplateReviews(templateId, limit, skip);

    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getReviews",
    });
  }
}

async function createReview(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(false, true);
    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const body = await req.json();
    const { templateId, rating, comment } = body;

    if (!templateId || !rating || !comment) {
      return createErrorResponse("Missing fields", 400, { req });
    }

    let review = await Review.findOne({ template: templateId, user: user._id });

    if (review) {
      if (review.isActive) {
        return createErrorResponse("User already reviewed this template", 400, { req });
      }
      review.isActive = true;
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      review = await Review.create({
        template: templateId,
        user: user._id,
        rating,
        comment,
      });
    }

    await revalidate(`/templates/${templateId}`);
    
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return createErrorResponse("User already reviewed this template", 400, {
        req,
        error: err,
      });
    }
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "createReview",
    });
  }
}

async function editReview(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(false, true);
    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const body = await req.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId || !rating || !comment) {
      return createErrorResponse("Missing fields", 400, { req });
    }

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: user._id },
      { rating, comment },
      { new: true },
    );

    if (!review) {
      return createErrorResponse("Review not found or unauthorized", 404, {
        req,
      });
    }

    await revalidate(`/templates/${review.template}`);
    
    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "editReview",
    });
  }
}

async function deleteReview(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(false, true);
    if (!user) {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return createErrorResponse("Missing reviewId", 400, { req });
    }

    // Soft delete
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: user._id },
      { isActive: false },
      { new: true },
    );

    if (!review) {
      return createErrorResponse("Review not found or unauthorized", 404, {
        req,
      });
    }

    await revalidate(`/templates/${review.template}`);

    return NextResponse.json({ success: true, message: "Review deleted" });
  } catch (err: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "deleteReview",
    });
  }
}

export const GET = withAPIMiddleware(getReviews);
export const POST = withAPIMiddleware(createReview);
export const PUT = withAPIMiddleware(editReview);
export const DELETE = withAPIMiddleware(deleteReview);

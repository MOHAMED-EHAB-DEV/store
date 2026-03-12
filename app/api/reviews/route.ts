import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Review from "@/lib/models/Review";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

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
    if (err && typeof err === 'object' && 'digest' in err) throw err;
        return handleApiError(err, req, { operation: "getReviews" });
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

        const review = await Review.create({
            template: templateId,
            user: user._id,
            rating,
            comment,
        });

        return NextResponse.json({ success: true, review }, { status: 201 });
    } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
        if (err.code === 11000) {
            return createErrorResponse("User already reviewed this template", 400, { req, error: err });
        }
        return handleApiError(err, req, { operation: "createReview" });
    }
}

export const GET = withAPIMiddleware(getReviews);
export const POST = withAPIMiddleware(createReview);


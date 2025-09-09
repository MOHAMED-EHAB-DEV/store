import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Review from "@/lib/models/Review";
import {authenticateUser} from "@/middleware/auth";

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get("templateId");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "6", 10);

        if (!templateId) {
            return NextResponse.json({ success: false, error: "templateId required" }, { status: 400 });
        }

        const skip = (page - 1) * limit;
        const reviews = await Review.findTemplateReviews(templateId, limit, skip);

        return NextResponse.json({ success: true, reviews });
    } catch (err) {
        console.error("Error fetching reviews", err);
        return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const user = await authenticateUser(false, true);
        if (!user) return NextResponse.json({success: false, message: "unauthorized access"}, {status: 400});

        const body = await req.json();
        const { templateId, rating, comment } = body;

        if (!templateId || !rating || !comment) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const review = await Review.create({
            template: templateId,
            user: user._id,
            rating,
            comment,
        });

        return NextResponse.json({ success: true, review }, { status: 201 });
    } catch (err: any) {
        if (err.code === 11000) {
            return NextResponse.json({ error: "User already reviewed this template" }, { status: 400 });
        }
        console.error("Error adding review", err);
        return NextResponse.json({ success: false, error: "Failed to add review" }, { status: 500 });
    }
}

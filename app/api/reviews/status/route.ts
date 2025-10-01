import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Review from "@/lib/models/Review";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get("templateId");
        const userId = searchParams.get("userId");

        if (!templateId || !userId) {
            return NextResponse.json({ error: "Missing templateId or userId" }, { status: 400 });
        }

        const existing = await Review.findOne({ template: templateId, user: userId, isActive: true });
        return NextResponse.json({ reviewed: !!existing });
    } catch (err) {
        console.error("Error checking review status", err);
        return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
    }
}

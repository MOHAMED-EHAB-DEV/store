import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await authenticateUser(true, false, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");

        // Get user's purchased templates
        // Assuming user has a purchasedTemplates array or similar
        const templates = await Template.find({
            _id: { $in: user.purchasedTemplates || [] },
        })
            .populate("category", "name")
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            message: "Templates fetched successfully",
            data: templates,
        });
    } catch (error: any) {
        console.error("Error fetching user templates:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch templates" },
            { status: 500 }
        );
    }
}

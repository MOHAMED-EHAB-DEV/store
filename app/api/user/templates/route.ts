import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function getUserTemplates(req: NextRequest) {
    try {
        await connectToDatabase();
        const user = await authenticateUser(false, false, true);
        if (!user) {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");

        // Get user's purchased templates
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
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "getUserTemplates" });
    }
}

export const GET = withAPIMiddleware(getUserTemplates);


import { NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import User from "@/lib/models/User";
import { connectToDatabase } from "@/lib/database";

type RouteContext = { params: Promise<any> };

export async function POST(request: Request, { params }: RouteContext) {
    try {
        const user = await authenticateUser(true, true);
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { reason, notes, expiresAt } = body;

        await connectToDatabase();
        const dbUser = await User.findById(id);

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate unique ban ID
        const banId = Math.random().toString(36).substring(2, 15).toUpperCase();

        // Update user with ban and metadata
        dbUser.banned = true;
        dbUser.banId = banId;
        dbUser.banMetadata = {
            reason: reason || "Violation of Terms of Service",
            bannedAt: new Date(),
            bannedBy: user._id?.toString() || "",
            notes: notes || "",
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        };

        await dbUser.save();

        return NextResponse.json({
            success: true,
            banId,
            message: "User banned successfully"
        });
    } catch (error: any) {
        console.error("Ban error:", error);
        return NextResponse.json({
            error: "Failed to ban user",
            message: error.message
        }, { status: 500 });
    }
}
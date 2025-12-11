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

        await connectToDatabase();
        const dbUser = await User.findById(id);

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Clear ban and metadata
        dbUser.banned = false;
        dbUser.banId = "";
        dbUser.banMetadata = undefined;

        await dbUser.save();

        return NextResponse.json({
            success: true,
            message: "User unbanned successfully"
        });
    } catch (error: any) {
        console.error("Unban error:", error);
        return NextResponse.json({
            error: "Failed to unban user",
            message: error.message
        }, { status: 500 });
    }
}
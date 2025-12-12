import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const user = await authenticateUser(false, true, true);

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        await User.findByIdAndUpdate(user._id, { online: false, lastSeen: new Date() }, { new: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking user as offline:", error);
        return NextResponse.json({ error: "Failed to mark user as offline" }, { status: 500 });
    }
}
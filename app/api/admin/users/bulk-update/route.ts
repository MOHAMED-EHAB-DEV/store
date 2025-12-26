import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const body = await req.json();
        const { userIds, updates } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { message: "User IDs array is required" },
                { status: 400 }
            );
        }

        if (!updates || typeof updates !== "object") {
            return NextResponse.json(
                { message: "Updates object is required" },
                { status: 400 }
            );
        }

        const result = await User.updateMany(
            {
                _id: { $in: userIds },
                role: { $ne: "admin" }, // Prevent updating admin users
            },
            { $set: updates }
        );

        return NextResponse.json({
            message: `${result.modifiedCount} users updated successfully`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error: any) {
        console.error("Error bulk updating users:", error);
        return NextResponse.json(
            { message: error.message || "Failed to update users" },
            { status: 500 }
        );
    }
}

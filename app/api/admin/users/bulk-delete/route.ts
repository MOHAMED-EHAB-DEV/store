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
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { message: "User IDs array is required" },
                { status: 400 }
            );
        }

        const result = await User.deleteMany({
            _id: { $in: userIds },
            role: { $ne: "admin" }, // Prevent deleting admin users
        });

        return NextResponse.json({
            message: `${result.deletedCount} users deleted successfully`,
            deletedCount: result.deletedCount,
        });
    } catch (error: any) {
        console.error("Error bulk deleting users:", error);
        return NextResponse.json(
            { message: error.message || "Failed to delete users" },
            { status: 500 }
        );
    }
}

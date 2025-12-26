import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import User from "@/lib/models/User";

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { emailNotifications, marketingEmails, weeklyDigest } = body;

        await connectToDatabase();
        const currentUser = await authenticateUser();

        if (!currentUser) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            currentUser._id,
            {
                $set: {
                    "preferences.emailNotifications": emailNotifications ?? true,
                    "preferences.marketingEmails": marketingEmails ?? false,
                    "preferences.weeklyDigest": weeklyDigest ?? true,
                },
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Preferences updated successfully",
            data: updatedUser,
        });
    } catch (error: any) {
        console.error("Error updating preferences:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update preferences" },
            { status: 500 }
        );
    }
}

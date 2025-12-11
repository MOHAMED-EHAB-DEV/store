import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] - Get single user details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await authenticateUser(true);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const user = await User.findById(id)
            .select("-password")
            .populate("purchasedTemplates", "title thumbnail price")
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch user" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/users/[id] - Update user (role, tier, ban status)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await authenticateUser(true);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const body = await request.json();
        const { name, role, tier, lockUntil, isEmailVerified } = body;

        // Prevent admin from demoting themselves
        if (id === admin._id && role && role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Cannot change your own role" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (tier) updateData.tier = tier;
        if (lockUntil !== undefined) updateData.lockUntil = lockUntil;
        if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .select("-password")
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
            message: "User updated successfully",
        });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update user" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/users/[id] - Delete user (or soft ban)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await authenticateUser(true);
        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Prevent admin from deleting themselves
        if (id === admin._id) {
            return NextResponse.json(
                { success: false, message: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete user" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

async function getAdminUser(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await authenticateUser(true);
        if (!admin || admin.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const user = await User.findById(id)
            .select("-password")
            .populate("purchasedTemplates", "title thumbnail price")
            .lean();

        if (!user) {
            return createErrorResponse("User not found", 404, { req: request });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminGetUser" });
    }
}

async function updateAdminUser(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await authenticateUser(true);
        if (!admin || admin.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;
        await connectToDatabase();

        const body = await request.json();
        const { name, role, tier, lockUntil, isEmailVerified } = body;

        // Prevent admin from demoting themselves
        if (id === String(admin?._id) && role && role !== "admin") {
            return createErrorResponse("Cannot change your own role", 400, { req: request });
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
            return createErrorResponse("User not found", 404, { req: request });
        }

        return NextResponse.json({
            success: true,
            data: user,
            message: "User updated successfully",
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminUpdateUser" });
    }
}

async function deleteAdminUser(request: NextRequest, { params }: RouteParams) {
    try {
        const admin = await authenticateUser(true);
        if (!admin || admin.role !== "admin") {
            return createErrorResponse("Unauthorized", 401, { req: request });
        }

        const { id } = await params;

        // Prevent admin from deleting themselves
        if (id === String(admin?._id)) {
            return createErrorResponse("Cannot delete your own account", 400, { req: request });
        }

        await connectToDatabase();

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return createErrorResponse("User not found", 404, { req: request });
        }

        return NextResponse.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, request, { operation: "adminDeleteUser" });
    }
}

export const GET = withAPIMiddleware(getAdminUser);
export const PUT = withAPIMiddleware(updateAdminUser);
export const DELETE = withAPIMiddleware(deleteAdminUser);


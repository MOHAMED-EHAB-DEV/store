import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import { authenticateUser } from "@/middleware/auth";
import User from "@/lib/models/User";
import revalidate from "@/actions/revalidateTag";
import { createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

async function updateProfile(req: NextRequest) {
    try {
        const { avatar, name } = await req.json();
        await connectToDatabase();
        const currentUser = await authenticateUser();

        if (!currentUser) {
            return createErrorResponse("No Session, User not found", 404, { req });
        }

        const dtUser = await User.findOne({ email: currentUser?.email });
        if (!dtUser) {
            return createErrorResponse("User not found", 404, { req });
        }

        const updatedUser = await User.findByIdAndUpdate(
            dtUser._id,
            {
                $set: { name, avatar },
            },
            { runValidators: true, new: true }
        );

        if (!updatedUser) {
            return createErrorResponse("User not found", 404, { req });
        }

        await revalidate("/settings");

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: "User updated Successfully"
        }, { status: 200 });
    } catch (err: any) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
        return handleApiError(err, req, { operation: "updateProfile" });
    }
}

export const POST = withAPIMiddleware(updateProfile);
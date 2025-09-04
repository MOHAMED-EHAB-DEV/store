import {NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/database";
import {authenticateUser} from "@/middleware/auth";
import User from "@/lib/models/User";
import revalidate from "@/actions/revalidateTag";

export async function POST(req: Request) {
    try {
        const {avatar, name} = await req.json();
        await connectToDatabase();
        const currentUser = await authenticateUser();

        if (!currentUser) return NextResponse.json({error: "No Session, User not found"}, {status: 404});

        const dtUser = await User.findOne({email: currentUser?.email});
        if (!dtUser) return NextResponse.json({error: "User not found", success: false,}, {status: 404});

        const updatedUser = await User.findByIdAndUpdate(
            dtUser._id,
            {
                $set: {name, avatar},
            },
            {runValidators: true, new: true}
        );

        if (!updatedUser) {
            return NextResponse.json(
                {success: false, error: "User not found"},
                {status: 404}
            );
        }

        await revalidate("/settings");

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: "User updated Successfully"
        }, {status: 200});
    } catch (err: any) {
        // console.log("Update user error:", err);
        return NextResponse.json(
            {success: false, message: err.message || "Something went wrong"},
            {status: 400}
        );
    }
}
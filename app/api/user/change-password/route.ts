import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {connectToDatabase} from "@/lib/database";
import User from "@/lib/models/User";
import {authenticateUser} from "@/middleware/auth";

export async function POST(req: Request) {

    try {
        const {email, password, newPassword} = await req.json();
        await connectToDatabase();
        const user = await authenticateUser();
        if (!user) return NextResponse.json({success: false, message: "No Session"}, {status: 404});

        const dtUser = await User.findOne({email});
        if (!dtUser) return NextResponse.json({success: false, message: "User Not Found"}, {status: 404});

        const validPassword = bcrypt.compare(password, dtUser?.password! as string)
        if (!validPassword) return NextResponse.json({success: false, message: "Invalid Password"}, {status: 401});

        const updatedUser = await User.findByIdAndUpdate(
            dtUser?._id!,
            {$set: {password: bcrypt.hashSync(newPassword)}},
            {runValidators: true, new: true}
        );

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: "Password updated Successfully"
        }, {status: 200});
    } catch (err) {
        return NextResponse.json({success: false, message: err}, {status: 400});
    }
}
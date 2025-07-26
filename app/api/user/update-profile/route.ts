import type {NextApiRequest} from 'next';
import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/database";
import {authenticateUser} from "@/middleware/auth";
import User from "@/lib/models/User";

export async function POST(req: NextApiRequest) {
    const {avatar, name} = req.body;
    try {
        await connectToDatabase();
        const currentUser = await authenticateUser();

        if (!currentUser) return NextResponse.json({error: "No Session, User not found"}, {status: 404});

        const dtUser = User.findOne({ _id: currentUser?.id });
        if (!dtUser) return NextResponse.json({ error: "User not found", success: false, }, {status: 404});

        // @ts-ignore
        let newUser: IUser = {};

        if (avatar) newUser.avatar = avatar;
        if (name) newUser.name = name;

        const updatedUser = await User.findByIdAndUpdate(
            currentUser?.id,
            { $set: { ...newUser } },
            { runValidators: true, new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedUser, message: "User updated Successfully" }, {status: 200});
    } catch (err) {
        return NextResponse.json({success: false, message: err}, {status: 400});
    }
}
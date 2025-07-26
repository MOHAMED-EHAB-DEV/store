import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/database";
import User from "@/lib/models/User";

export async function GET(
    req: Request,
    {params}: { params: { id: string } },
) {
    const {id} = await params;
    try {
        await connectToDatabase();

        const user = await User.findOne({_id: id}, {
            email: 1,
            name: 1,
            avatar: 1,
            role: 1,
            purchasedTemplates: 1,
            favorites: 1,
            createdAt: 1,
        });

        if (!user) return NextResponse.json({success: false, message: "User not found"}, { status: 404 });

        return NextResponse.json({user, success: true, message: "User found"}, {status: 201});
    } catch (err) {
        return NextResponse.json({message: err, success: false}, { status: 400 });
    }
}
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {connectToDatabase} from "@/lib/database";
import User from "@/lib/models/User";

export async function POST(
    req: Request,
) {
    try {
        const { email, password } = await req.json();
        await connectToDatabase();

        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ success: false, message: "User not Found" }, { status: 401 });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return NextResponse.json({ success: false, message: "Invalid Password" }, { status: 401 });

        const token = jwt.sign(
            { id: user?._id, email, avatar: user?.avatar },
            process.env.JWT_SECRET! as string,
            { expiresIn: "7d" },
        );

        const response = NextResponse.json(
            {
                message: "Login successful",
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                success: true,
            },
            { status: 200 }
        );

        response?.cookies?.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            // domain: process.env.NODE_ENV === "production" ? ".vercel.app" : "",
            path: "/",
        });

        return response;
    } catch (err) {
        return NextResponse.json({ success: false, message: err }, { status: 400 });
    }
}
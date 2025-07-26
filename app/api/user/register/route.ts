import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/database";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();
        await connectToDatabase();

        const user = await User.findOne({ email });
        if (user) return NextResponse.json({ message: "User already exists" }, { status: 404 });

        const newUser = new User({
            name,
            email,
            password: bcrypt.hashSync(password, 10),
        });

        await newUser.save();

        const JWT_SECRET = process.env.JWT_SECRET! as string;

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }

        const token = jwt.sign(
            { id: newUser?._id!, email: newUser?.email!, avatar: newUser?.avatar! },
            JWT_SECRET,
            { expiresIn: "7d" },
        );

        const response = NextResponse.json(
            {
                message: "Registered successfully",
                user: {
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            },
            { status: 200 }
        );

        response?.cookies?.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60,
            domain: process.env.NODE_ENV === "production" ? ".vercel.app" : "",
            path: "/",
        });

        return response;
    } catch (err) {
        return NextResponse.json({ message: err.message, success: false }, { status: 400 });
    }
}
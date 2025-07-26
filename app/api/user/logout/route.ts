import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logged out successfully" },
            { status: 200 }
        );

        // Clear the auth cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            // domain: process.env.NODE_ENV === "production" ? ".vercel.app" : "",
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";

export async function POST(req: NextRequest) {
    try {
        const user = await authenticateUser();

        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();
        const body = await req.json();

        const template = await Template.create({
            ...body,
            author: user._id,
            downloads: 0,
            averageRating: 0,
            reviewCount: 0,
            views: 0,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Template created successfully",
                data: template,
            },
            { status: 201 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { success: false, message: err.message || "Failed to create template" },
            { status: 500 }
        );
    }
}

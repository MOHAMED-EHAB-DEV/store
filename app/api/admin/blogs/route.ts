import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";

export async function GET(req: NextRequest) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "100");

        const blogs = await Blog.find()
            .populate("author", "name email")
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            message: "Blogs fetched successfully",
            data: blogs,
        });
    } catch (error: any) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json(
            { message: error.message || "Failed to fetch blogs" },
            { status: 500 }
        );
    }
}

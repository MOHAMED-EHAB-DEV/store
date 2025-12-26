import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const blog = await Blog.findByIdAndDelete(params.id);

        if (!blog) {
            return NextResponse.json(
                { message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Blog deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting blog:", error);
        return NextResponse.json(
            { message: error.message || "Failed to delete blog" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const body = await req.json();

        const blog = await Blog.findByIdAndUpdate(
            params.id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!blog) {
            return NextResponse.json(
                { message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error: any) {
        console.error("Error updating blog:", error);
        return NextResponse.json(
            { message: error.message || "Failed to update blog" },
            { status: 500 }
        );
    }
}

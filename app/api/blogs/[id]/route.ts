import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import { createAPIResponse, createErrorResponse } from "@/lib/utils/api-helpers";
import User from "@/lib/models/User";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const countViews = searchParams.get("countViews") === "true";
        await connectToDatabase();

        // Try finding by ID first, then slug
        let post = null;

        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            post = await Blog.findById(id).populate('author', 'name avatar').lean();
        }

        if (!post) {
            post = await Blog.findOne({ slug: id }).populate('author', 'name avatar').lean();
        }

        if (!post) {
            return createErrorResponse("Blog post not found", 404);
        }

        // Increment views if public
        if (typeof post.views === 'number' && countViews) {
            // Fire and forget update
            Blog.updateOne({ _id: post._id }, { $inc: { views: 1 } }).exec();
        }

        return createAPIResponse(post);
    } catch (error: any) {
        console.error("API Error:", error);
        return createErrorResponse(error.message || "Internal Server Error", 500);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        await connectToDatabase();
        const user = await authenticateUser(false, true);

        if (!user) return createErrorResponse("Unauthorized", 401);

        const dbUser = await User.findById(user._id);
        if (dbUser?.role !== 'admin') {
            return createErrorResponse("Forbidden", 403);
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });

        if (!updatedBlog) {
            return createErrorResponse("Blog post not found", 404);
        }

        return createAPIResponse(updatedBlog, { message: "Blog post updated successfully" });

    } catch (error: any) {
        console.error("API Error:", error);
        return createErrorResponse(error.message || "Internal Server Error", 500);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await connectToDatabase();
        const user = await authenticateUser(false, true);

        if (!user) return createErrorResponse("Unauthorized", 401);

        const dbUser = await User.findById(user._id);
        if (dbUser?.role !== 'admin') {
            return createErrorResponse("Forbidden", 403);
        }

        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return createErrorResponse("Blog post not found", 404);
        }

        return createAPIResponse(null, { message: "Blog post deleted successfully" });

    } catch (error: any) {
        console.error("API Error:", error);
        return createErrorResponse(error.message || "Internal Server Error", 500);
    }
}

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import { createAPIResponse, createErrorResponse, handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";
import User from "@/lib/models/User";
import { updateTag } from "next/cache";

async function getBlogPost(
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
            return createErrorResponse("Blog post not found", 404, { req });
        }

        // Increment views if public
        if (typeof post.views === 'number' && countViews) {
            // Fire and forget update
            Blog.updateOne({ _id: post._id }, { $inc: { views: 1 } }).exec();
        }

        return createAPIResponse(post);
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "getBlogPost" });
    }
}

async function updateBlogPost(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        await connectToDatabase();
        const user = await authenticateUser(false, true);

        if (!user) return createErrorResponse("Unauthorized", 401, { req });

        const dbUser = await User.findById(user._id);
        if (dbUser?.role !== 'admin') {
            return createErrorResponse("Forbidden", 403, { req });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });

        if (!updatedBlog) {
            return createErrorResponse("Blog post not found", 404, { req });
        }

        updateTag("blogs");
        updateTag(`blog-${updatedBlog.slug}`);

        return createAPIResponse(updatedBlog, { message: "Blog post updated successfully" });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "updateBlogPost" });
    }
}

async function deleteBlogPost(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await connectToDatabase();
        const user = await authenticateUser(false, true);

        if (!user) return createErrorResponse("Unauthorized", 401, { req });

        const dbUser = await User.findById(user._id);
        if (dbUser?.role !== 'admin') {
            return createErrorResponse("Forbidden", 403, { req });
        }

        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            return createErrorResponse("Blog post not found", 404, { req });
        }

        return createAPIResponse(null, { message: "Blog post deleted successfully" });
    } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return handleApiError(error, req, { operation: "deleteBlogPost" });
    }
}

export const GET = withAPIMiddleware(getBlogPost);
export const PUT = withAPIMiddleware(updateBlogPost);
export const DELETE = withAPIMiddleware(deleteBlogPost);


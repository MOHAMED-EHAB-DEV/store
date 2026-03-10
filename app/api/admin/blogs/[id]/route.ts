import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await authenticateUser(true, true);
        if (!user) {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return createErrorResponse("Blog not found", 404, { req, operation: "adminDeleteBlog" });
        }

        return NextResponse.json({
            message: "Blog deleted successfully",
        });
    } catch (error: any) {
        return handleApiError(error, req, { operation: "adminDeleteBlog" });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await connectToDatabase();
        const user = await authenticateUser();
        if (!user) {
            return createErrorResponse("Unauthorized", 401, { req });
        }


        const body = await req.json();

        const blog = await Blog.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!blog) {
            return createErrorResponse("Blog not found", 404, { req, operation: "adminUpdateBlog" });
        }

        return NextResponse.json({
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error: any) {
        return handleApiError(error, req, { operation: "adminUpdateBlog" });
    }
}

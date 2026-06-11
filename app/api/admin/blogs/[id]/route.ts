import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/middleware/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function deleteAdminBlog(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateUser(true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return createErrorResponse("Blog not found", 404, { req });
    }

    return createAPIResponse(blog,
      {
        message: "Blog deleted successfully",
      },
    );
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, { req, error, operation: "adminDeleteBlog" });
  }
}

async function updateAdminBlog(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    const body = await req.json();

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!blog) {
      return createErrorResponse("Blog not found", 404, { req });
    }

    return createAPIResponse(
      {
        data: blog,
      },
      {
        message: "Blog updated successfully",
      },
    );
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, { req, error, operation: "adminUpdateBlog" });
  }
}

export const DELETE = withAPIMiddleware(deleteAdminBlog);
export const PATCH = withAPIMiddleware(updateAdminBlog);

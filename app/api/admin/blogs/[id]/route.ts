import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/lib/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { isBase64Image } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";

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

    await revalidate("/blog");
    await revalidateWithTag(`blog-${id}`);

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

    // Handle cover image upload if it is base64
    if (body.coverImage && isBase64Image(body.coverImage)) {
      const base64Data = body.coverImage.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const uploadResult = await uploadToCloudinary(buffer, "blogs");
      body.coverImage = uploadResult.secure_url;
    }

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!blog) {
      return createErrorResponse("Blog not found", 404, { req });
    }

    await revalidate("/blog");
    await revalidateWithTag(`blog-${blog?.slug}`);

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

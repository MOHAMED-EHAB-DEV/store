import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Blog from "@/lib/models/Blog";
import { authenticateUser } from "@/lib/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import User from "@/lib/models/User";
import { isBase64Image } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/cloudinary";

async function getAdminBlogs(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status === "published") query.isPublished = true;
    if (status === "draft") query.isPublished = false;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, total, stats] = await Promise.all([
      Blog.find(query)
        .populate("author", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Blog.countDocuments(query),
      Blog.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: { $sum: { $cond: ["$isPublished", 1, 0] } },
            drafts: { $sum: { $cond: ["$isPublished", 0, 1] } },
            totalViews: { $sum: "$views" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            published: 1,
            drafts: 1,
            totalViews: 1,
          },
        },
      ]),
    ]);

    return createAPIResponse(
      {
        data: blogs,
        stats: stats[0] || { total: 0, published: 0, drafts: 0, totalViews: 0 },
      },
      {
        message: "Blogs fetched successfully",
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, { req, error, operation: "adminGetBlogs" });
  }
}

async function createBlog(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const user = await authenticateUser(false, true);
    if (!user) return createErrorResponse("Unauthorized", 401, { req });

    const dbUser = await User.findById(user._id);
    if (dbUser?.role !== 'admin') {
      return createErrorResponse("Forbidden: Admin access only", 403, { req });
    }

    // Auto-generate slug if missing
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Add author
    body.author = user._id;

    // Handle cover image upload if it is base64
    if (body.coverImage && isBase64Image(body.coverImage)) {
      const base64Data = body.coverImage.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const uploadResult = await uploadToCloudinary(buffer, "blogs");
      body.coverImage = uploadResult.secure_url;
    }

    const newBlog = await Blog.create(body);

    await revalidate("/blog");

    return createAPIResponse(newBlog, { message: "Blog post created successfully" });
  } catch (error: any) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "createBlog" });
  }
}

export const GET = withAPIMiddleware(getAdminBlogs);
export const POST = withAPIMiddleware(createBlog);

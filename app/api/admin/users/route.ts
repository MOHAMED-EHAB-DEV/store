import { NextRequest } from "next/server";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";

async function getAdminUsers(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser();
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req: request });
    }

    const { searchParams } = new URL(request.url);
    const { limit, skip, page } = validatePagination(request);
    const role = searchParams.get("role");
    const tier = searchParams.get("tier");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (tier) query.tier = tier;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [users, total, stats] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            free: { $sum: { $cond: [{ $eq: ["$tier", "free"] }, 1, 0] } },
            premium: { $sum: { $cond: [{ $eq: ["$tier", "premium"] }, 1, 0] } },
            verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            free: 1,
            premium: 1,
            verified: 1,
          },
        },
      ]),
    ]);

    return createAPIResponse(
      {
        items: users,
        stats: stats[0] || { total: 0, free: 0, premium: 0, verified: 0 },
      },
      {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: request, error: error, message: "Failed to fetch users",
      operation: "adminGetUsers", });
  }
}

export const GET = withAPIMiddleware(getAdminUsers);

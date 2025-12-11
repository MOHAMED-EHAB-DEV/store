import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import User from "@/lib/models/User";
import { authenticateUser } from "@/middleware/auth";

// GET /api/admin/users - List all users with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const role = searchParams.get("role");
        const tier = searchParams.get("tier");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const skip = (page - 1) * limit;

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

        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password")
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch users" },
            { status: 500 }
        );
    }
}

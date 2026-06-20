import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Ticket from "@/lib/models/Ticket";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";

async function getAdminTickets(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const { limit, skip, page } = validatePagination(req);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { "user.name": { $regex: search, $options: "i" } },
      ];
    }

    const [tickets, total, stats] = await Promise.all([
      Ticket.find(query)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
      Ticket.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
            },
            closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            open: 1,
            inProgress: 1,
            closed: 1,
          },
        },
      ]),
    ]);

    return createAPIResponse(
      {
        items: tickets,
        stats: stats[0] || { total: 0, open: 0, inProgress: 0, closed: 0 },
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
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminGetTickets" });
  }
}

export const GET = withAPIMiddleware(getAdminTickets);

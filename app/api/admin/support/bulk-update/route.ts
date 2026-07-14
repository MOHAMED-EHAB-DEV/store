import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Ticket from "@/lib/models/Ticket";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkUpdateSupport(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { ticketIds, updates } = body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return createErrorResponse("Ticket IDs array is required", 400, { req });
    }

    if (!updates || typeof updates !== "object") {
      return createErrorResponse("Updates object is required", 400, { req });
    }

    const result = await Ticket.updateMany(
      {
        _id: { $in: ticketIds },
      },
      { $set: updates },
    );

    return createAPIResponse(
      { modifiedCount: result.modifiedCount },
      { message: `${result.modifiedCount} tickets updated successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkUpdateSupport" });
  }
}

export const POST = withAPIMiddleware(bulkUpdateSupport);

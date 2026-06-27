import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Ticket from "@/lib/models/Ticket";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

async function bulkDeleteSupport(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    const body = await req.json();
    const { ticketIds } = body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return createErrorResponse("Ticket IDs array is required", 400, { req });
    }

    const result = await Ticket.deleteMany({
      _id: { $in: ticketIds },
    });

    return createAPIResponse(
      { deletedCount: result.deletedCount },
      { message: `${result.deletedCount} tickets deleted successfully` },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "adminBulkDeleteSupport" });
  }
}

export const POST = withAPIMiddleware(bulkDeleteSupport);

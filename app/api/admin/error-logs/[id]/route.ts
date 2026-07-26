import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import ErrorLog from "@/lib/models/ErrorLog";
import { authenticateUser } from "@/lib/auth";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";

async function updateErrorLog(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    const updateFields: any = {};
    if (typeof body.resolved === "boolean") {
      updateFields.resolved = body.resolved;
      updateFields.resolvedAt = body.resolved ? new Date() : null;
    }
    if (typeof body.notes === "string") {
      updateFields.notes = body.notes;
    }

    const updatedLog = await ErrorLog.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("userId", "name email avatar");

    if (!updatedLog) {
      return createErrorResponse("Error log not found", 404, { req });
    }

    return createAPIResponse(updatedLog, {
      message: "Error log updated successfully",
    });
  } catch (error: any) {
    return createErrorResponse("Failed to update error log", 500, {
      req,
      error,
      operation: "adminUpdateSingleErrorLog",
    });
  }
}

export const PATCH = withAPIMiddleware(updateErrorLog);

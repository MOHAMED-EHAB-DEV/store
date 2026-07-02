import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
  validatePagination,
} from "@/lib/utils/api-helpers";
import { revalidateWithTag } from "@/actions/revalidateTag";

async function deleteAdminTemplate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();

    const template = await Template.findByIdAndDelete(id);

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    return createAPIResponse(null, {
      message: "Template deleted successfully",
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "adminDeleteTemplate",
    });
  }
}

async function updateAdminTemplate(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    const { id } = await params;
    await connectToDatabase();

    const body = await req.json();

    const template = await Template.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    revalidateWithTag(`template-${id}`);

    return createAPIResponse(template, {
      message: "Template updated successfully",
    });
  } catch (error: any) {
    console.log(error);
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "adminUpdateTemplate",
    });
  }
}

export const DELETE = withAPIMiddleware(deleteAdminTemplate);
export const PATCH = withAPIMiddleware(updateAdminTemplate);

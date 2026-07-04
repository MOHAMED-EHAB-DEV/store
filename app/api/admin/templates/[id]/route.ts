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
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";
import Category from "@/lib/models/Category";

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

    if (template.categories) {
      await Category.updateMany(
        { _id: { $in: template.categories } },
        { $inc: { templateCount: -1 } },
      );
    }

    await revalidateWithTag("categories");
    await revalidate("/");

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
      { runValidators: true },
    );

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    // If categories are changed, exactly calculate additions and removals
    if (body.categories) {
      const oldCats = (template.categories || []).map((c: any) => c.toString());
      const newCats = body.categories.map((c: any) => c.toString());

      const added = newCats.filter((c: string) => !oldCats.includes(c));
      const removed = oldCats.filter((c: string) => !newCats.includes(c));

      console.log(added, removed);

      if (removed.length > 0) {
        await Category.updateMany(
          { _id: { $in: removed } },
          { $inc: { templateCount: -1 } },
        );
      }
      
      if (added.length > 0) {
        await Category.updateMany(
          { _id: { $in: added } },
          { $inc: { templateCount: 1 } },
        );
      }
    }

    await revalidateWithTag(`template-${id}`);
    await revalidateWithTag("categories");
    await revalidate("/");

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

async function getAdminTemplate(
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

    const template = await Template.findById(id)
      .select(
        "title description content categories tags demoLink price thumbnail builtWith type isPaid",
      )
      .lean();

    if (!template) {
      return createErrorResponse("Template not found", 404, { req });
    }

    return createAPIResponse(template);
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
      operation: "adminGetTemplate",
    });
  }
}

export const DELETE = withAPIMiddleware(deleteAdminTemplate);
export const PATCH = withAPIMiddleware(updateAdminTemplate);
export const GET = withAPIMiddleware(getAdminTemplate);

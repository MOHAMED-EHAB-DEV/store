import { NextRequest } from "next/server";
import Review from "@/lib/models/Review";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import {
  withAPIMiddleware,
  createErrorResponse,
  createAPIResponse,
} from "@/lib/utils/api-helpers";
import revalidate from "@/actions/revalidateTag";

type RouteContext = { params: Promise<{ id: string }> };

async function getTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    const [template, totalReviews] = await Promise.all([
      Template.findOne({ _id: id })
        .select("+content")
        .populate("categories", "_id name slug")
        .lean(),
      Review.countDocuments({ template: id }),
    ]);
    return createAPIResponse({ ...template, reviews: totalReviews });
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getPublicTemplate",
    });
  }
}

async function updateTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updated = await Template.findByIdAndUpdate(id, body, { new: true });

    revalidate(`template-${id}`);

    return createAPIResponse(
      updated,
      {
        message: "Template Updated Successfully",
      },
    );
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "updatePublicTemplate",
    });
  }
}

async function disableTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndUpdate(id, {
      isActive: false,
    }); // soft delete

    revalidate(`template-${id}`);

    return createAPIResponse(
      {},
      {
        message: "Template disabled successfully",
      },
    );
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "disablePublicTemplate",
    });
  }
}

async function deleteTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndDelete(id); // Delete from database

    revalidate(`template-${id}`);

    return createAPIResponse(
      {},
      {
        message: "Template deleted successfully",
      },
    );
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err) throw err;
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "deletePublicTemplate",
    });
  }
}

export const GET = withAPIMiddleware(getTemplate);
export const PATCH = withAPIMiddleware(updateTemplate);
export const POST = withAPIMiddleware(disableTemplate);
export const DELETE = withAPIMiddleware(deleteTemplate);

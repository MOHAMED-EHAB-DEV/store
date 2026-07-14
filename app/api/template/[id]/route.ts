import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import Review from "@/lib/models/Review";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import {
  withAPIMiddleware,
  createErrorResponse,
  createAPIResponse,
} from "@/lib/utils/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

async function getTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    const query = isValidObjectId(id)
      ? { $or: [{ _id: id }, { slug: id }], isActive: true }
      : { slug: id, isActive: true };

    const template = await Template.findOne(query)
      .select("+content +reviewCount")
      .populate("categories", "_id name slug")
      .lean();

    return createAPIResponse(template);
  } catch (err) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: err,
      operation: "getPublicTemplate",
    });
  }
}

export const GET = withAPIMiddleware(getTemplate);
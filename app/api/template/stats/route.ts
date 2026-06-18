import { NextRequest } from "next/server";
import Template from "@/lib/models/Template";
import {
  withAPIMiddleware,
  createErrorResponse,
  createAPIResponse,
} from "@/lib/utils/api-helpers";
import { connectToDatabase } from "@/lib/database";

async function getTemplateStats(req: NextRequest) {
  try {
    await connectToDatabase();
    const stats = await Template.getTemplateStats();
    return createAPIResponse(stats[0] || {});
  } catch (error: any) {
    return createErrorResponse("Something went wrong", 500, { req: req, error: error, operation: "getTemplateStats" });
  }
}

export const GET = withAPIMiddleware(getTemplateStats);


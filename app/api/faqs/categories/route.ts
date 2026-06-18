import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import {
  createAPIResponse,
  createErrorResponse,
  withAPIMiddleware,
} from "@/lib/utils/api-helpers";
import { NextRequest } from "next/server";

async function getCategories(req: NextRequest) {
  try {
    await connectToDatabase();

    const categories = await FAQ.getCategories();

    return createAPIResponse(categories);
  } catch (error) {
    return createErrorResponse("Something went wrong", 500, {
      req: req,
      error: error,
    });
  }
}

export const GET = withAPIMiddleware(getCategories);


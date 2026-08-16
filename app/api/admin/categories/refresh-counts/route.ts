import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";
import "@/lib/models/Template";
import { authenticateUser } from "@/lib/auth";
import {
  createErrorResponse,
  withAPIMiddleware,
  createAPIResponse,
} from "@/lib/utils/api-helpers";
import revalidate, { revalidateWithTag } from "@/actions/revalidateTag";

async function refreshAllTemplateCounts(req: NextRequest) {
  try {
    const user = await authenticateUser(true, true, true);
    if (!user || user.role !== "admin") {
      return createErrorResponse("Unauthorized", 401, { req });
    }

    await connectToDatabase();

    await Category.refreshAllTemplateCounts();

    await revalidateWithTag("categories");
    await revalidateWithTag("home-templates");
    await revalidate("/admin/categories");

    return createAPIResponse(
      { success: true },
      { message: "All category template counts refreshed successfully" },
    );
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return createErrorResponse("Something went wrong", 500, {
      req,
      error,
      operation: "adminRefreshAllCategoryTemplateCounts",
    });
  }
}

export const POST = withAPIMiddleware(refreshAllTemplateCounts);

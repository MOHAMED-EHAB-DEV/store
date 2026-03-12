import { NextRequest, NextResponse } from "next/server";
import Review from "@/lib/models/Review";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { revalidateTag } from "next/cache";
import { handleApiError, withAPIMiddleware } from "@/lib/utils/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

async function getTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    const [template, totalReviews] = await Promise.all([
      Template.findOne({ _id: id }).select('+content').populate("categories", "_id name slug").lean(),
      Review.countDocuments({ template: id }),
    ]);
    return NextResponse.json(
      { success: true, data: { ...template, reviews: totalReviews } },
      { status: 200 }
    );
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    return handleApiError(err, req, { operation: "getPublicTemplate" });
  }
}

async function updateTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updated = await Template.findByIdAndUpdate(id, body, { new: true });

    // Revalidate cache for this template and all templates
    revalidateTag(`template-${id}`, 'default');
    revalidateTag('templates', 'default');

    return NextResponse.json(
      {
        success: true,
        message: "Template Updated Successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    return handleApiError(err, req, { operation: "updatePublicTemplate" });
  }
}

async function disableTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndUpdate(id, {
      isActive: false,
    }); // soft delete

    // Revalidate cache for this template and all templates
    revalidateTag(`template-${id}`, 'default');
    revalidateTag('templates', 'default');

    return NextResponse.json({
      success: true,
      message: "Template disabled Successfully",
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    return handleApiError(err, req, { operation: "disablePublicTemplate" });
  }
}

async function deleteTemplate(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndDelete(id); // Delete from database

    // Revalidate cache for this template and all templates
    revalidateTag(`template-${id}`, 'default');
    revalidateTag('templates', 'default');

    return NextResponse.json({
      success: true,
      message: "Template deleted Successfully",
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    return handleApiError(err, req, { operation: "deletePublicTemplate" });
  }
}

export const GET = withAPIMiddleware(getTemplate);
export const PATCH = withAPIMiddleware(updateTemplate);
export const POST = withAPIMiddleware(disableTemplate);
export const DELETE = withAPIMiddleware(deleteTemplate);


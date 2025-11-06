import { NextRequest, NextResponse } from "next/server";
import Review from "@/lib/models/Review";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await connectToDatabase();

    const [template, totalReviews] = await Promise.all([
      Template.findOne({_id: id}).select('+content').populate("categories", "_id name slug").lean(),
      Review.countDocuments({ template: id }),
    ]);
    return NextResponse.json(
      { success: true, data: { ...template, reviews: totalReviews } },
      { status: 200 }
    );
  } catch (err) {
    // console.log(`Error while getting the template: ${err}`);
    return NextResponse.json({ message: err, success: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updated = await Template.findByIdAndUpdate(id, body);
    return NextResponse.json(
      {
        success: true,
        message: "Template Updated Successfully",
        data: updated,
      },
      { status: 200 }
    );
  } catch (err) {
    // console.log(`Error while updating the template: ${err}`);
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndUpdate(id, {
      isActive: false,
    }); // soft delete
    return NextResponse.json({
      success: true,
      message: "Template disabled Successfully",
    });
  } catch (err) {
    // console.log(`Error while disabling the template: ${err}`);
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    await Template.findByIdAndDelete(id); // Delete from database
    return NextResponse.json({
      success: true,
      message: "Template deleted Successfully",
    });
  } catch (err) {
    // console.log(`Error while deleting the template: ${err}`);
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}

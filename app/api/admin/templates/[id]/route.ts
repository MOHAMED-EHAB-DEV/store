import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const template = await Template.findByIdAndDelete(id);

        if (!template) {
            return NextResponse.json(
                { message: "Template not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Template deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting template:", error);
        return NextResponse.json(
            { message: error.message || "Failed to delete template" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        const body = await req.json();

        const template = await Template.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!template) {
            return NextResponse.json(
                { message: "Template not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Template updated successfully",
            data: template,
        });
    } catch (error: any) {
        console.error("Error updating template:", error);
        return NextResponse.json(
            { message: error.message || "Failed to update template" },
            { status: 500 }
        );
    }
}

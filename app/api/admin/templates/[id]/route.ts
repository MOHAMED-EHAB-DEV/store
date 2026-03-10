import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import { authenticateUser } from "@/middleware/auth";
import { createErrorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await authenticateUser(true, true, true);
        if (!user) {
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const template = await Template.findByIdAndDelete(id);

        if (!template) {
            return createErrorResponse("Template not found", 404, { req, operation: "adminDeleteTemplate" });
        }

        return NextResponse.json({
            message: "Template deleted successfully",
        });
    } catch (error: any) {
        return handleApiError(error, req, { operation: "adminDeleteTemplate" });
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
            return createErrorResponse("Unauthorized", 401, { req });
        }

        await connectToDatabase();

        const body = await req.json();

        const template = await Template.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!template) {
            return createErrorResponse("Template not found", 404, { req, operation: "adminUpdateTemplate" });
        }

        return NextResponse.json({
            message: "Template updated successfully",
            data: template,
        });
    } catch (error: any) {
        return handleApiError(error, req, { operation: "adminUpdateTemplate" });
    }
}

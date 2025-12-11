import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database";
import FAQ from "@/lib/models/FAQ";
import { authenticateUser } from "@/middleware/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/faqs/[id] - Get single FAQ
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const faq = await FAQ.findById(id).lean();

        if (!faq) {
            return NextResponse.json(
                { success: false, message: "FAQ not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: faq });
    } catch (error: any) {
        console.error("Error fetching FAQ:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to fetch FAQ" },
            { status: 500 }
        );
    }
}

// PUT /api/admin/faqs/[id] - Update FAQ
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const body = await request.json();
        const { question, answer, category, order, isPublished, coverImage } = body;

        const faq = await FAQ.findByIdAndUpdate(
            id,
            {
                ...(question && { question }),
                ...(answer && { answer }),
                ...(category && { category }),
                ...(order !== undefined && { order }),
                ...(isPublished !== undefined && { isPublished }),
                ...(coverImage !== undefined && { coverImage }),
            },
            { new: true, runValidators: true }
        ).lean();

        if (!faq) {
            return NextResponse.json(
                { success: false, message: "FAQ not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: faq,
            message: "FAQ updated successfully",
        });
    } catch (error: any) {
        console.error("Error updating FAQ:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to update FAQ" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/faqs/[id] - Delete FAQ
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await authenticateUser(true);
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        await connectToDatabase();

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return NextResponse.json(
                { success: false, message: "FAQ not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "FAQ deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting FAQ:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Failed to delete FAQ" },
            { status: 500 }
        );
    }
}

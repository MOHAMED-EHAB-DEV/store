import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/TemplateService';
import { authenticateUser } from "@/middleware/auth";
import { UserService } from "@/lib/services/UserService";
import { slugify } from '@/lib/utils/slugify';
import { markdownToHtml } from '@/lib/utils/markdownToHtml';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const user = await authenticateUser();

        if (!user)
            return NextResponse.json({ success: false, message: "No Session" }, { status: 401 });

        const dtUser = await UserService.findById(user._id);
        if (!dtUser)
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

        if (dtUser.role !== "admin")
            return NextResponse.json({ success: false, message: "Invalid access, User isn't admin" }, { status: 401 });

        // ✨ Add slug and HTML content
        const slug = slugify(body.title || "template");
        const contentHtml = markdownToHtml(body.markdown || "");

        const created = await TemplateService.createTemplate({
            ...body,
            slug,
            contentHtml,
        });

        return NextResponse.json({ success: true, data: created }, { status: 200 });
    } catch (err) {
        console.error("Error creating template:", err);
        return NextResponse.json({ message: "Internal Server Error", success: false }, { status: 500 });
    }
}
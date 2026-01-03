import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TemplateForm from "@/components/Admin/TemplateForm";
import { connectToDatabase } from "@/lib/database";
import Template from "@/lib/models/Template";
import Category from "@/lib/models/Category";

export const metadata: Metadata = {
    title: "Edit Template | Admin",
    description: "Edit template details"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getTemplate(id: string) {
    await connectToDatabase();
    try {
        const template = await Template.findById(id).lean();
        return template ? JSON.parse(JSON.stringify(template)) : null;
    } catch (error) {
        return null;
    }
}

async function getCategories() {
    await connectToDatabase();
    try {
        const categories = await Category.find({ isActive: true }).select("_id name").lean();
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        return [];
    }
}

export default async function EditTemplatePage({ params }: PageProps) {
    const { id } = await params;
    const [template, categories] = await Promise.all([
        getTemplate(id),
        getCategories()
    ]);

    if (!template) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/templates"
                    className="text-muted-foreground hover:text-white transition-colors"
                >
                    ← Back to Templates
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-white">Edit Template</h1>
                <p className="text-muted-foreground">Update template details</p>
            </div>

            <TemplateForm initialData={template} isEdit categories={categories} />
        </div>
    );
}

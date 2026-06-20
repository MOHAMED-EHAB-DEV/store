import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import TemplateForm from "@/components/Admin/TemplateForm";
import { getCategories } from "@/static/categories";

export const metadata: Metadata = {
    title: "Edit Template | Admin",
    description: "Edit template details"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getTemplate(id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/templates/${id}`, { headers: await headers() });
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return null;
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

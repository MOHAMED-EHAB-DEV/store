import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/templates/${id}`, { headers: { cookie: (await headers()).get("cookie") || "" } });
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
        return notFound();
    }

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Edit Template"
                description="Update template details"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Templates", href: "/admin/templates" },
                    { label: "Edit Template" }
                ]}
            />

            <TemplateForm initialData={template} isEdit categories={categories} />
        </div>
    );
}

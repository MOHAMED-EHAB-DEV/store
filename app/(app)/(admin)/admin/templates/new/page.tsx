import { Metadata } from "next";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import TemplateForm from "@/components/Admin/TemplateForm";
import { getCategories } from "@/static/categories";

export const metadata: Metadata = {
    title: "Create Template | Admin",
    description: "Create a new template"
};

export default async function NewTemplatePage() {
    const categories = await getCategories();

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Create New Template"
                description="Add a new template to the store"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Templates", href: "/admin/templates" },
                    { label: "Create Template" }
                ]}
            />

            <TemplateForm categories={categories} />
        </div>
    );
}

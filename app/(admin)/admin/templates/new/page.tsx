import { Metadata } from "next";
import Link from "next/link";
import TemplateForm from "@/components/Admin/TemplateForm";
import { connectToDatabase } from "@/lib/database";
import Category from "@/lib/models/Category";

export const metadata: Metadata = {
    title: "Create Template | Admin",
    description: "Create a new template"
};

async function getCategories() {
    await connectToDatabase();
    try {
        const categories = await Category.find({ isActive: true }).select("_id name").lean();
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        return [];
    }
}

export default async function NewTemplatePage() {
    const categories = await getCategories();

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
                <h1 className="text-2xl font-bold text-white">Create New Template</h1>
                <p className="text-muted-foreground">Add a new template to the store</p>
            </div>

            <TemplateForm categories={categories} />
        </div>
    );
}

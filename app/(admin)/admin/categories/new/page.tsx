import { Metadata } from "next";
import Link from "next/link";
import CategoryForm from "@/components/Admin/CategoryForm";

export const metadata: Metadata = {
    title: "Create Category | Admin",
    description: "Create a new template category"
};

async function getParentCategories() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/categories?limit=100`);

        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
    } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return [];
    }
}

export default async function NewCategoryPage() {
    const parentCategories = await getParentCategories();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/categories"
                    className="text-muted-foreground hover:text-white transition-colors"
                >
                    ← Back to Categories
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-white">Create New Category</h1>
                <p className="text-muted-foreground">Add a new template category</p>
            </div>

            <CategoryForm parentCategories={parentCategories} />
        </div>
    );
}

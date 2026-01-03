import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import CategoryForm from "@/components/Admin/CategoryForm";

export const metadata: Metadata = {
    title: "Edit Category | Admin",
    description: "Edit template category"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getCategory(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/admin/categories/${id}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        return null;
    }
}

async function getParentCategories() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/admin/categories?limit=100`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        return [];
    }
}

export default async function EditCategoryPage({ params }: PageProps) {
    const { id } = await params;
    const [category, parentCategories] = await Promise.all([
        getCategory(id),
        getParentCategories()
    ]);

    if (!category) {
        notFound();
    }

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
                <h1 className="text-2xl font-bold text-white">Edit Category</h1>
                <p className="text-muted-foreground">Update category details</p>
            </div>

            <CategoryForm
                initialData={category}
                isEdit
                parentCategories={parentCategories}
            />
        </div>
    );
}

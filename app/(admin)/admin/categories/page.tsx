import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import CategoriesTable from "@/components/Admin/CategoriesTable";

export const metadata: Metadata = {
    title: "Categories Management | Admin",
    description: "Manage template categories"
};

async function getCategories(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    params.set("includeInactive", "true");
    params.set("limit", "50");

    try {
        const response = await fetch(`${baseUrl}/api/admin/categories?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return { categories: [], pagination: null };
        const data = await response.json();
        return { categories: data.data || [], pagination: data.pagination };
    } catch (error) {
        return { categories: [], pagination: null };
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { categories, pagination } = await getCategories(params);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Categories Management</h1>
                    <p className="text-muted-foreground">
                        {pagination?.total || 0} total categories
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                    + New Category
                </Link>
            </div>

            {/* Search */}
            <div className="glass rounded-xl p-4">
                <form className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search categories..."
                        defaultValue={params.search || ""}
                        className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Categories Table */}
            <CategoriesTable categories={categories} pagination={pagination} searchParams={params} />
        </div>
    );
}

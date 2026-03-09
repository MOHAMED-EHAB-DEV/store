import { Metadata } from "next";
import AdminCategoriesClient from "@/components/Admin/AdminCategoriesClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
    title: "Categories Management | Admin Dashboard",
    description: "Manage template categories and organization",
    robots: "noindex, nofollow",
};

async function getCategories(searchParams: { [key: string]: string | undefined }) {
    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.isActive) params.set("includeInactive", searchParams.isActive === "false" ? "true" : "false");
    params.set("limit", "20");

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/categories?${params.toString()}`);

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = await getCategories(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load categories. Please try again."
                />
            </div>
        );
    }

    return (
        <AdminCategoriesClient
            initialData={data.data}
            stats={data.stats}
            pagination={data.pagination}
            searchParams={params}
        />
    );
}

import { Metadata } from "next";
import { cookies } from "next/headers";
import AdminTemplatesClient from "@/components/Admin/AdminTemplatesClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";
import { getCategories } from "@/static/categories";

export const metadata: Metadata = {
    title: "Templates Management | Admin Dashboard",
    description: "Manage all templates, categories, and downloads",
    robots: "noindex, nofollow",
};

async function getTemplatesData(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.tier) params.set("tier", searchParams.tier);
    if (searchParams.status) params.set("status", searchParams.status);
    params.set("limit", "20");

    try {
        const [templatesRes, categories] = await Promise.all([
            fetch(`${baseUrl}/api/admin/templates?${params.toString()}`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            getCategories()
        ]);

        if (!templatesRes.ok) return null;

        const templatesData = await templatesRes.json();

        return {
            templates: templatesData.data || [],
            stats: templatesData.stats,
            pagination: templatesData.pagination,
            categories: categories || [],
        };
    } catch (error) {
        console.error("Error fetching templates data:", error);
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminTemplatesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = await getTemplatesData(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load templates. Please try again."
                />
            </div>
        );
    }

    return (
        <AdminTemplatesClient
            initialData={data.templates}
            stats={data.stats}
            pagination={data.pagination}
            categories={data.categories}
            searchParams={params}
        />
    );
}
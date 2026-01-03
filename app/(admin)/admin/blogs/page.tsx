import { Metadata } from "next";
import { cookies } from "next/headers";
import AdminBlogsClient from "@/components/Admin/AdminBlogsClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
    title: "Blogs Management | Admin Dashboard",
    description: "Manage blog posts and content",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getBlogs(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.status) params.set("status", searchParams.status);
    params.set("limit", "20");

    try {
        const response = await fetch(`${baseUrl}/api/admin/blogs?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminBlogsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = await getBlogs(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load blogs. Please try again."
                />
            </div>
        );
    }

    return (
        <AdminBlogsClient
            initialData={data.data}
            stats={data.stats}
            pagination={data.pagination}
            searchParams={params}
        />
    );
}

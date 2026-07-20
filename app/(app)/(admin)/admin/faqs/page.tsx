import { Suspense } from "react";
import { Metadata } from "next";
import { headers } from "next/headers";
import AdminFAQsClient from "@/components/Admin/AdminFAQsClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
    title: "FAQs Management | Admin",
    description: "Manage frequently asked questions"
};

async function getFAQsData(searchParams: { [key: string]: string | undefined }) {
    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.published) params.set("published", searchParams.published);
    params.set("limit", "20");

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/faqs?${params.toString()}`, { headers: { cookie: (await headers()).get("cookie") || "" } });

        if (!response.ok) return null;
        const data = await response.json()
        return data;
    } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminFAQsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { data, pagination } = await getFAQsData(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load FAQs. Please try again."
                />
            </div>
        );
    }

    // Default stats if not provided by backend
    const faqStats = data.stats || {
        total: pagination?.total || 0,
        published: data.items.filter((f: any) => f.isPublished).length,
        draft: data.items.filter((f: any) => !f.isPublished).length,
        categories: [...new Set(data.items.map((f: any) => f.category))].length
    };

    return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Loading data...</div>}>
      <AdminFAQsClient
            initialData={data.items}
            stats={faqStats}
            pagination={pagination}
            searchParams={params}
        />
    </Suspense>
  );
}

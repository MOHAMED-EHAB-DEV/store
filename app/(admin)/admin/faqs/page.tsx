import { Metadata } from "next";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import AdminFAQsClient from "@/components/Admin/AdminFAQsClient";
import { HelpCircle } from "@/components/ui/svgs/icons/HelpCircle";
import { Check } from "@/components/ui/svgs/icons/Check";
import { AlertCircle } from "@/components/ui/svgs/icons/AlertCircle";
import { Grid } from "@/components/ui/svgs/icons/Grid";
import StatCard from "@/components/Dashboard/shared/StatCard";
import ErrorState from "@/components/Dashboard/shared/ErrorState";
import { headers } from "next/headers";

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
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/faqs?${params.toString()}`, {
            headers: await headers(),
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminFAQsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = await getFAQsData(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load FAQs. Please try again."
                />
            </div>
        );
    }

    const { data: faqs, pagination, stats } = data;

    // Default stats if not provided by backend
    const faqStats = stats || {
        total: pagination?.total || 0,
        published: faqs.filter((f: any) => f.isPublished).length,
        draft: faqs.filter((f: any) => !f.isPublished).length,
        categories: [...new Set(faqs.map((f: any) => f.category))].length
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="FAQs Management"
                description="Create and manage helpful frequently asked questions for your users"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "FAQs" },
                ]}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total FAQs"
                    value={faqStats.total}
                    icon={HelpCircle}
                    gradient="from-blue-500 to-cyan-500"
                />
                <StatCard
                    label="Published"
                    value={faqStats.published}
                    icon={Check}
                    gradient="from-green-500 to-emerald-500"
                />
                <StatCard
                    label="Drafts"
                    value={faqStats.draft}
                    icon={AlertCircle}
                    gradient="from-amber-500 to-orange-500"
                />
                <StatCard
                    label="Categories"
                    value={faqStats.categories}
                    icon={Grid}
                    gradient="from-purple-500 to-pink-500"
                />
            </div>

            <AdminFAQsClient
                initialData={faqs}
                pagination={pagination}
                searchParams={params}
            />
        </div>
    );
}

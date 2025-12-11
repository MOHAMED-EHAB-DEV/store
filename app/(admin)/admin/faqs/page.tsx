import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import FAQsTable from "@/components/Admin/FAQsTable";

export const metadata: Metadata = {
    title: "FAQs Management | Admin",
    description: "Manage frequently asked questions"
};

async function getFAQs(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.search) params.set("search", searchParams.search);
    params.set("limit", "20");

    try {
        const response = await fetch(`${baseUrl}/api/admin/faqs?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return { faqs: [], pagination: null };
        const data = await response.json();
        return { faqs: data.data || [], pagination: data.pagination };
    } catch (error) {
        return { faqs: [], pagination: null };
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminFAQsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { faqs, pagination } = await getFAQs(params);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">FAQs Management</h1>
                    <p className="text-muted-foreground">
                        {pagination?.total || 0} total FAQs
                    </p>
                </div>
                <Link
                    href="/admin/faqs/new"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                    + New FAQ
                </Link>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4">
                <form className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search FAQs..."
                        defaultValue={params.search || ""}
                        className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <select
                        name="category"
                        defaultValue={params.category || ""}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Categories</option>
                        <option value="general">General</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="account">Account</option>
                        <option value="templates">Templates</option>
                        <option value="other">Other</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* FAQs Table */}
            <FAQsTable faqs={faqs} pagination={pagination} searchParams={params} />
        </div>
    );
}

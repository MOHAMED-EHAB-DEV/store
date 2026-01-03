import { Metadata } from "next";
import { cookies } from "next/headers";
import DownloadLogsClient from "@/components/Admin/DownloadLogsClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
    title: "Download Logs | Admin Dashboard",
    description: "View and analyze all template downloads with detailed analytics",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getDownloadLogs(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.templateId) params.set("templateId", searchParams.templateId);
    if (searchParams.userId) params.set("userId", searchParams.userId);
    if (searchParams.status) params.set("status", searchParams.status);
    params.set("limit", "20");

    try {
        const response = await fetch(`${baseUrl}/api/admin/download-logs?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching download logs:", error);
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function DownloadLogsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = await getDownloadLogs(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load download logs. Please try again."
                />
            </div>
        );
    }

    return (
        <DownloadLogsClient
            initialData={data.data}
            stats={data.stats}
            pagination={data.pagination}
            searchParams={params}
        />
    );
}

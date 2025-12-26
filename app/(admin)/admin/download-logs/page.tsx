import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DownloadLogsClient from "@/components/Admin/DownloadLogsClient";
import { authenticateUser } from "@/middleware/auth";
import { ErrorState } from "@/components/Dashboard/shared/LoadingStates";

export const metadata: Metadata = {
    title: "Download Logs | Admin Dashboard",
    description: "View and analyze all template downloads with detailed analytics",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getDownloadLogs() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/admin/download-logs?limit=1000`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        const data = response.ok ? await response.json() : { data: [] };
        return data.data || [];
    } catch (error) {
        console.error("Error fetching download logs:", error);
        return null;
    }
}

export default async function DownloadLogsPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const logs = await getDownloadLogs();

    if (logs === null) {
        return <ErrorState message="Failed to load download logs. Please refresh the page." />;
    }

    return <DownloadLogsClient logs={logs} />;
}

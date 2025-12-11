import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Download Logs | Admin",
    description: "View template download history"
};

async function getDownloadLogs(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.templateId) params.set("templateId", searchParams.templateId);
    if (searchParams.status) params.set("status", searchParams.status);
    if (searchParams.startDate) params.set("startDate", searchParams.startDate);
    if (searchParams.endDate) params.set("endDate", searchParams.endDate);
    params.set("limit", "50");

    try {
        const response = await fetch(`${baseUrl}/api/admin/download-logs?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return { logs: [], pagination: null };
        const data = await response.json();
        return { logs: data.data || [], pagination: data.pagination };
    } catch (error) {
        return { logs: [], pagination: null };
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminDownloadLogsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { logs, pagination } = await getDownloadLogs(params);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Download Logs</h1>
                    <p className="text-muted-foreground">
                        {pagination?.total || 0} total downloads
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4">
                <form className="flex flex-wrap gap-4">
                    <select
                        name="status"
                        defaultValue={params.status || ""}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>
                    <input
                        type="date"
                        name="startDate"
                        defaultValue={params.startDate || ""}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        name="endDate"
                        defaultValue={params.endDate || ""}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="End Date"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Logs Table */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Template</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">IP</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No download logs found
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="text-white font-medium">
                                                {log.templateId?.title || log.filename || "Unknown"}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            {log.userId ? (
                                                <div>
                                                    <p className="text-white text-sm">{log.userId.name}</p>
                                                    <p className="text-xs text-muted-foreground">{log.userId.email}</p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Anonymous</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm font-mono">
                                            {log.ip}
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            {pagination.page > 1 && (
                                <Link
                                    href={`/admin/download-logs?page=${pagination.page - 1}&status=${params.status || ""}&startDate=${params.startDate || ""}&endDate=${params.endDate || ""}`}
                                    className="px-3 py-1 bg-white/5 rounded text-sm text-white hover:bg-white/10"
                                >
                                    Previous
                                </Link>
                            )}
                            {pagination.page < pagination.pages && (
                                <Link
                                    href={`/admin/download-logs?page=${pagination.page + 1}&status=${params.status || ""}&startDate=${params.startDate || ""}&endDate=${params.endDate || ""}`}
                                    className="px-3 py-1 bg-white/5 rounded text-sm text-white hover:bg-white/10"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

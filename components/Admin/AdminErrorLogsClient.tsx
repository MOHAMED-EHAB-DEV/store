"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sonnerToast } from "@/components/ui/sonner";
import { Terminal } from "@/components/ui/svgs/icons/Terminal";
import { User as UserIcon } from "@/components/ui/svgs/icons/User";
import { Globe } from "@/components/ui/svgs/icons/Globe";
import { Clock } from "@/components/ui/svgs/icons/Clock";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRight";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface ErrorLog {
    _id: string;
    message: string;
    stack?: string;
    digest?: string;
    route?: string;
    method?: string;
    status?: number;
    operation?: string;
    userId?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    visitorId?: string;
    userAgent?: string;
    ip?: string;
    timestamp: string;
}

interface AdminErrorLogsClientProps {
    initialData: ErrorLog[];
    pagination: any;
}

export default function AdminErrorLogsClient({
    initialData,
    pagination,
}: AdminErrorLogsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const queryParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
    const [deleteOldLogsDialog, setDeleteOldLogsDialog] = useState<number | null>(null);

    const updateQuery = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(queryParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        if (!updates.page) params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const executeDeleteOldLogs = async () => {
        if (!deleteOldLogsDialog) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/error-logs?days=${deleteOldLogsDialog}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success(data.message);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete logs");
            }
        } catch (error) {
            sonnerToast.error("An error occurred");
        } finally {
            setLoading(false);
            setDeleteOldLogsDialog(null);
        }
    };

    const filterOptions: FilterOption[] = [
        {
            key: "method",
            label: "Method",
            options: [
                { value: "GET", label: "GET" },
                { value: "POST", label: "POST" },
                { value: "CLIENT", label: "CLIENT" },
            ],
        },
        {
            key: "status",
            label: "Status",
            options: [
                { value: "500", label: "500 (Error)" },
                { value: "401", label: "401 (Auth)" },
                { value: "403", label: "403 (Forbidden)" },
                { value: "404", label: "404 (Not Found)" },
            ],
        },
    ];

    const columns: Column<ErrorLog>[] = [
        {
            key: "message",
            label: "Error Message",
            render: (log) => (
                <div className="max-w-md truncate">
                    <p className="text-sm font-medium text-white truncate">{log.message}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                        {log.route || "Global"}
                    </p>
                </div>
            ),
        },
        {
            key: "method",
            label: "Context",
            render: (log) => (
                <div className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline" className={log.method === 'CLIENT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-gray-500/10 text-gray-400'}>
                            {log.method || 'N/A'}
                        </Badge>
                        {log.status !== undefined && (
                            <Badge variant="outline" className={log.status >= 500 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}>
                                {log.status === 0 ? 'CLIENT-ERR' : log.status}
                            </Badge>
                        )}
                    </div>
                    {log.operation && <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{log.operation}</span>}
                </div>
            ),
        },
        {
            key: "userId",
            label: "User/Visitor",
            render: (log) => (
                <div className="flex flex-col gap-1">
                    {log.userId ? (
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-purple-400" />
                             </div>
                             <span className="text-xs text-white">{log.userId.name}</span>
                        </div>
                    ) : log.visitorId ? (
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Globe className="w-3 h-3 text-blue-400" />
                             </div>
                             <span className="text-xs text-muted-foreground truncate max-w-[80px]">{log.visitorId}</span>
                        </div>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Guest</span>
                    )}
                </div>
            ),
        },
        {
            key: "timestamp",
            label: "Time",
            render: (log) => (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                </div>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (log) => (
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedLog(log)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="System Error Logs"
                description="Monitor and debug application errors in real-time"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Error Logs" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setDeleteOldLogsDialog(30)}
                            className="bg-red-500/5 hover:bg-red-500/10 text-red-400 border-red-500/20"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Old Logs
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <SearchFilterBar
                        searchPlaceholder="Search logs by message or route..."
                        onSearchChange={(val) => updateQuery({ search: val })}
                        filters={filterOptions}
                        onFilterChange={(key, val) => updateQuery({ [key]: val })}
                        activeFilters={{
                            method: queryParams.get("method") || "",
                            status: queryParams.get("status") || "",
                        }}
                        onClearFilters={() => updateQuery({ method: "", status: "", search: "" })}
                    />

                    <DataTable
                        columns={columns}
                        data={initialData}
                        keyExtractor={(log) => log._id}
                        loading={loading}
                        emptyState={
                            <EmptyState
                                icon={Terminal}
                                title="No error logs found"
                                description="Everything looks good! No recent errors were detected."
                            />
                        }
                    />

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <p className="text-sm text-muted-foreground">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() => updateQuery({ page: (pagination.page - 1).toString() })}
                                    className="bg-white/5 border-white/10 text-white"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => updateQuery({ page: (pagination.page + 1).toString() })}
                                    className="bg-white/5 border-white/10 text-white"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detailed View Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 border border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        {selectedLog ? (
                            <div className="flex flex-col h-[calc(100vh-12rem)]">
                                <div className="p-6 border-b border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
                                    <div className="flex items-start justify-between mb-4">
                                        <Badge className="bg-red-500 text-white border-0">
                                            {selectedLog.status === 0 ? 'CLIENT_SIDE' : `STATUS ${selectedLog.status}`}
                                        </Badge>
                                        <button 
                                            onClick={() => setSelectedLog(null)}
                                            className="text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                                        {selectedLog.message}
                                    </h3>
                                    <p className="text-xs font-mono text-muted-foreground break-all">
                                        {selectedLog.route}
                                    </p>
                                </div>

                                <div className="flex-1 overflow-auto p-6 space-y-6">
                                    {/* Context Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Context Info</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase mb-1">Method</p>
                                                <p className="text-sm font-medium text-white">{selectedLog.method}</p>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase mb-1">Operation</p>
                                                <p className="text-sm font-medium text-white">{selectedLog.operation || 'None'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">User / Visitor Data</h4>
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                            {selectedLog.userId ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                                        {selectedLog.userId.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{selectedLog.userId.name}</p>
                                                        <p className="text-xs text-muted-foreground">{selectedLog.userId.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                                        <Globe className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-400">Anonymous Visitor</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">{selectedLog.visitorId || 'No visitor ID'}</p>
                                                    </div>
                                                    {selectedLog.visitorId && (
                                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] border border-white/5" onClick={() => router.push(`/admin/visitors/${selectedLog.visitorId}`)}>
                                                            View Journey
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-white/5">
                                                <p className="text-[10px] text-gray-500 uppercase mb-1">IP Address</p>
                                                <p className="text-xs font-mono text-gray-300">{selectedLog.ip || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase mb-1">User Agent</p>
                                                <p className="text-[10px] font-mono text-gray-400 leading-relaxed italic">{selectedLog.userAgent}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stack Trace */}
                                    {selectedLog.stack && (
                                        <div className="space-y-4 pb-4">
                                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Stack Trace</h4>
                                            <pre className="p-4 bg-black/60 rounded-xl text-[10px] font-mono text-red-400/70 overflow-x-auto border border-red-500/10 leading-relaxed capitalize">
                                                {selectedLog.stack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white/5 to-transparent">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <Eye className="w-8 h-8 text-gray-600" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Select a Log</h3>
                                <p className="text-sm text-muted-foreground max-w-[200px]">
                                    Click the view icon on any log to see complete details and stack trace
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={deleteOldLogsDialog !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteOldLogsDialog(null);
                }}
                onConfirm={executeDeleteOldLogs}
                title="Clear Old Logs"
                description={`Are you sure you want to delete logs older than ${deleteOldLogsDialog} days? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

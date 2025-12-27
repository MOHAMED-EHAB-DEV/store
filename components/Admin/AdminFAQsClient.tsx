"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown from "@/components/Dashboard/shared/ActionDropdown";
import { Edit, Trash2, Plus, ExternalLink } from "@/components/ui/svgs/Icons";
import { sonnerToast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminFAQsClientProps {
    initialData: any[];
    pagination: any;
    searchParams: any;
}

export default function AdminFAQsClient({
    initialData,
    pagination,
    searchParams,
}: AdminFAQsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const queryParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    // Filtering options
    const filterOptions: FilterOption[] = [
        {
            key: "category",
            label: "Category",
            options: [
                { value: "general", label: "General" },
                { value: "billing", label: "Billing" },
                { value: "technical", label: "Technical" },
                { value: "account", label: "Account" },
                { value: "templates", label: "Templates" },
                { value: "other", label: "Other" },
            ],
        },
        {
            key: "published",
            label: "Status",
            options: [
                { value: "true", label: "Published" },
                { value: "false", label: "Draft" },
            ],
        },
    ];

    const updateQuery = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(queryParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        // Reset to page 1 on search/filter change
        if (!updates.page) params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/faqs/${deleteDialog.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success("FAQ deleted successfully");
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete FAQ");
            }
        } catch (error) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const columns: Column<any>[] = [
        {
            key: "question",
            label: "Question",
            sortable: true,
            render: (faq) => (
                <div className="max-w-[400px]">
                    <p className="font-medium text-white line-clamp-1">{faq.question}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{faq.answer}</p>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            sortable: true,
            render: (faq) => (
                <Badge variant="outline" className="capitalize bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {faq.category}
                </Badge>
            ),
        },
        {
            key: "order",
            label: "Order",
            sortable: true,
            render: (faq) => <span className="text-muted-foreground">{faq.order}</span>,
        },
        {
            key: "isPublished",
            label: "Status",
            sortable: true,
            render: (faq) => (
                <Badge
                    variant="outline"
                    className={
                        faq.isPublished
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    }
                >
                    {faq.isPublished ? "Published" : "Draft"}
                </Badge>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (faq) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "Edit FAQ",
                            icon: Edit,
                            onClick: () => router.push(`/admin/faqs/edit/${faq._id}`),
                        },
                        {
                            label: "Preview",
                            icon: ExternalLink,
                            onClick: () => window.open(`/faqs`, "_blank"),
                        },
                        {
                            label: "Delete",
                            icon: Trash2,
                            onClick: () => setDeleteDialog({ open: true, id: faq._id }),
                            variant: "destructive",
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <SearchFilterBar
                    searchPlaceholder="Search questions or answers..."
                    onSearchChange={(val) => updateQuery({ search: val })}
                    filters={filterOptions}
                    onFilterChange={(key, val) => updateQuery({ [key]: val })}
                    activeFilters={{
                        category: queryParams.get("category") || "",
                        published: queryParams.get("published") || "",
                    }}
                    onClearFilters={() => updateQuery({ category: "", published: "", search: "" })}
                />
                <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/admin/faqs/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New FAQ
                    </Link>
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={initialData}
                keyExtractor={(faq) => faq._id}
                loading={loading}
                emptyState={
                    <EmptyState
                        title="No FAQs found"
                        description="Try adjusting your filters or search terms"
                        action={{
                            label: "Add New FAQ",
                            onClick: () => router.push("/admin/faqs/new"),
                            icon: Plus,
                        }}
                    />
                }
                actions={
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground mr-2">
                            Showing {initialData.length} of {pagination?.total || 0} entries
                        </span>
                    </div>
                }
            />

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => updateQuery({ page: (pagination.page - 1).toString() })}
                            className="bg-white/5 border-white/10"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => updateQuery({ page: (pagination.page + 1).toString() })}
                            className="bg-white/5 border-white/10"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
                onConfirm={handleDelete}
                title="Delete FAQ"
                description="Are you sure you want to delete this FAQ? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import { Edit } from "@/components/ui/svgs/icons/Edit";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import { Plus } from "@/components/ui/svgs/icons/Plus";
import { ExternalLink } from "@/components/ui/svgs/icons/ExternalLink";
import { HelpCircle } from "@/components/ui/svgs/icons/HelpCircle";
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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

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

    const handleBulkDelete = async () => {

        setIsDeleting(true);
        try {
            const response = await fetch("/api/admin/faqs/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ faqIds: selectedIds }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} FAQs deleted successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete FAQs");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkStatusChange = async (isPublished: boolean) => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/faqs/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ faqIds: selectedIds, updates: { isPublished } }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} FAQs updated successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update FAQs");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
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
                            label: "Preview",
                            icon: ExternalLink,
                            onClick: () => window.open(`/faqs`, "_blank"),
                        },
                        ...createDefaultActions({
                            onEdit: () => router.push(`/admin/faqs/edit/${faq._id}`),
                            onDelete: () => setDeleteDialog({ open: true, id: faq._id }),
                        })
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="FAQs Management"
                description="Manage frequently asked questions"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "FAQs" },
                ]}
                actions={
                    <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90"
                        asChild
                    >
                        <Link href="/admin/faqs/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New FAQ
                        </Link>
                    </Button>
                }
            />

            <div className="space-y-6">
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

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-sm text-white">
                            {selectedIds.length} FAQ{selectedIds.length !== 1 ? "s" : ""} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => handleBulkStatusChange(true)}
                                disabled={loading}
                            >
                                Publish
                            </Button>
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => handleBulkStatusChange(false)}
                                disabled={loading}
                            >
                                Unpublish
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBulkDeleteDialog(true)}
                                disabled={isDeleting}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete ({selectedIds.length})
                            </Button>
                        </div>
                    </div>
                )}

                <DataTable
                    columns={columns}
                    data={initialData}
                    keyExtractor={(faq) => faq._id}
                    loading={loading}
                    selectable
                    onSelectionChange={(ids) => setSelectedIds(ids as string[])}
                    emptyState={
                        <EmptyState
                            icon={HelpCircle}
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
                                className="bg-white/5 border-white/10 text-white"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => updateQuery({ page: (pagination.page + 1).toString() })}
                                className="bg-white/5 border-white/10 text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

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
            <ConfirmDialog
                open={bulkDeleteDialog}
                onOpenChange={setBulkDeleteDialog}
                onConfirm={handleBulkDelete}
                title="Delete FAQs"
                description={`Are you sure you want to delete ${selectedIds.length} FAQs? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

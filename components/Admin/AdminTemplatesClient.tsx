"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Templates } from "@/components/ui/svgs/icons/Templates";
import { Plus } from "@/components/ui/svgs/icons/Plus";
import { Download } from "@/components/ui/svgs/icons/Download";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sonnerToast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ICategory, ITemplate } from "@/types";

interface AdminTemplatesClientProps {
    initialData: ITemplate[];
    stats: {
        total: number;
        active: number;
        premium: number;
        totalDownloads: number;
    };
    pagination: any;
    categories: ICategory[];
    searchParams: any;
}

export default function AdminTemplatesClient({
    initialData,
    stats,
    pagination,
    categories,
    searchParams,
}: AdminTemplatesClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const queryParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const filterOptions: FilterOption[] = [
        {
            key: "category",
            label: "Category",
            options: categories.map((cat) => ({ value: cat._id, label: cat.name })),
        },
        {
            key: "tier",
            label: "Tier",
            options: [
                { value: "free", label: "Free" },
                { value: "premium", label: "Premium" },
            ],
        },
        {
            key: "status",
            label: "Status",
            options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
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
        if (!updates.page) params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/templates/${deleteDialog.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success("Template deleted successfully");
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete template");
            }
        } catch (error) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleToggleStatus = async (template: ITemplate) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/templates/${template._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !template.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success(`Template ${!template.isActive ? "activated" : "deactivated"} successfully`);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update template");
            }
        } catch (error) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<ITemplate>[] = [
        {
            key: "title",
            label: "Template",
            sortable: true,
            render: (template) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center">
                            <Templates className="w-6 h-6 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{template.title}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            render: (template) => (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {typeof template.categories[0] === "object" ? (template.categories[0] as any).name : "Uncategorized"}
                </Badge>
            ),
        },
        {
            key: "price",
            label: "Price",
            sortable: true,
            render: (template) => (
                <Badge
                    variant="outline"
                    className={
                        template.price !== 0
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }
                >
                    {template.price === 0 ? "Free" : `$${template.price}`}
                </Badge>
            ),
        },
        {
            key: "downloads",
            label: "Downloads",
            sortable: true,
            render: (template) => (
                <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-white">{template.downloads || 0}</span>
                </div>
            ),
        },
        {
            key: "isActive",
            label: "Status",
            sortable: true,
            render: (template) => (
                <Badge
                    variant="outline"
                    className={
                        template.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                >
                    {template.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            sortable: true,
            render: (template) => (
                <time className="text-sm text-muted-foreground" dateTime={template.createdAt as any}>
                    {new Date(template.createdAt).toLocaleDateString()}
                </time>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (template) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "View",
                            icon: Eye,
                            onClick: () => window.open(`/templates/${template._id}`, "_blank"),
                        },
                        ...createDefaultActions({
                            onEdit: () => router.push(`/admin/templates/edit/${template._id}`),
                            onDelete: () => setDeleteDialog({ open: true, id: template._id })
                        }),
                        {
                            label: template.isActive ? "Deactivate" : "Activate",
                            onClick: () => handleToggleStatus(template),
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ];

    const statCardsData = [
        {
            label: "Total Templates",
            value: stats.total,
            icon: Templates,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Premium",
            value: stats.premium,
            icon: Templates,
            gradient: "from-amber-500 to-orange-500",
        },
        {
            label: "Total Downloads",
            value: stats.totalDownloads,
            icon: Download,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "Categories",
            value: categories.length,
            icon: Templates,
            gradient: "from-blue-500 to-cyan-500",
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Templates Management"
                description="Manage all templates, categories, and downloads"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Templates" },
                ]}
                actions={
                    <Button onClick={() => router.push("/admin/templates/new")} className="bg-primary hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Template
                    </Button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCardsData.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="space-y-6">
                <SearchFilterBar
                    searchPlaceholder="Search templates..."
                    onSearchChange={(val) => updateQuery({ search: val })}
                    filters={filterOptions}
                    onFilterChange={(key, val) => updateQuery({ [key]: val })}
                    activeFilters={{
                        category: queryParams.get("category") || "",
                        tier: queryParams.get("tier") || "",
                        status: queryParams.get("status") || "",
                    }}
                    onClearFilters={() => updateQuery({ category: "", tier: "", status: "", search: "" })}
                />

                <DataTable
                    columns={columns}
                    data={initialData}
                    keyExtractor={(template) => template._id}
                    loading={loading}
                    selectable
                    onSelectionChange={(ids) => setSelectedIds(ids as string[])}
                    exportFilename="templates"
                    emptyState={
                        <EmptyState
                            icon={Templates}
                            title="No templates found"
                            description="Try adjusting your filters or add your first template"
                            action={{
                                label: "Add Template",
                                onClick: () => router.push("/admin/templates/new"),
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
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

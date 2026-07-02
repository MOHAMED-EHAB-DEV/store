"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Grid } from "@/components/ui/svgs/icons/Grid";
import { Plus } from "@/components/ui/svgs/icons/Plus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sonnerToast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Link from "next/link";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    templateCount?: number;
    isActive: boolean;
    createdAt: string;
}

interface AdminCategoriesClientProps {
    initialData: Category[];
    stats: {
        total: number;
        active: number;
        inactive: number;
        totalTemplates: number;
    };
    pagination: any;
    searchParams: any;
}

export default function AdminCategoriesClient({
    initialData,
    stats,
    pagination,
    searchParams,
}: AdminCategoriesClientProps) {
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

    const filterOptions: FilterOption[] = [
        {
            key: "isActive",
            label: "Status",
            options: [
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
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
            const res = await fetch(`/api/admin/categories/${deleteDialog.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success("Category deleted successfully");
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete category");
            }
        } catch (error) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleToggleStatus = async (category: Category) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories/${category._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !category.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success(`Category ${!category.isActive ? "activated" : "deactivated"} successfully`);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update category");
            }
        } catch (error) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkDelete = async () => {

        setIsDeleting(true);
        try {
            const response = await fetch("/api/admin/categories/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryIds: selectedIds }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} categories deleted successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete categories");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkStatusChange = async (isActive: boolean) => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/categories/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryIds: selectedIds, updates: { isActive } }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} categories updated successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update categories");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Category>[] = [
        {
            key: "name",
            label: "Name",
            sortable: true,
            render: (category) => (
                <div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.slug}</p>
                </div>
            ),
        },
        {
            key: "description",
            label: "Description",
            render: (category) => (
                <p className="text-sm text-muted-foreground truncate max-w-md">
                    {category.description || "No description"}
                </p>
            ),
        },
        {
            key: "templateCount",
            label: "Templates",
            sortable: true,
            render: (category) => (
                <span className="text-sm text-white">{category.templateCount || 0}</span>
            ),
        },
        {
            key: "isActive",
            label: "Status",
            sortable: true,
            render: (category) => (
                <Badge
                    variant="outline"
                    className={
                        category.isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                    }
                >
                    {category.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            sortable: true,
            render: (category) => (
                <time className="text-sm text-muted-foreground" dateTime={category.createdAt}>
                    {new Date(category.createdAt).toLocaleDateString()}
                </time>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (category) => (
                <ActionDropdown
                    actions={[
                        ...createDefaultActions({
                            onEdit: () => router.push(`/admin/categories/edit/${category._id}`),
                            onDelete: () => setDeleteDialog({ open: true, id: category._id })
                        }),
                        {
                            label: category.isActive ? "Deactivate" : "Activate",
                            onClick: () => handleToggleStatus(category),
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ];

    const statCardsData = [
        {
            label: "Total Categories",
            value: stats.total,
            icon: Grid,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Active",
            value: stats.active,
            icon: Grid,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "Inactive",
            value: stats.inactive,
            icon: Grid,
            gradient: "from-amber-500 to-orange-500",
        },
        {
            label: "Total Templates",
            value: stats.totalTemplates,
            icon: Grid,
            gradient: "from-blue-500 to-cyan-500",
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Categories Management"
                description="Manage template categories and organization"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Categories" },
                ]}
                actions={
                    <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90"
                        asChild
                    >
                        <Link href="/admin/categories/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Link>
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
                    searchPlaceholder="Search categories..."
                    onSearchChange={(val) => updateQuery({ search: val })}
                    filters={filterOptions}
                    onFilterChange={(key, val) => updateQuery({ [key]: val })}
                    activeFilters={{
                        isActive: queryParams.get("isActive") || "",
                    }}
                    onClearFilters={() => updateQuery({ isActive: "", search: "" })}
                />

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-sm text-white">
                            {selectedIds.length} categor{selectedIds.length !== 1 ? "ies" : "y"} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => handleBulkStatusChange(true)}
                                disabled={loading}
                            >
                                Activate
                            </Button>
                            <Button
                                variant="glass"
                                size="sm"
                                onClick={() => handleBulkStatusChange(false)}
                                disabled={loading}
                            >
                                Deactivate
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
                    keyExtractor={(category) => category._id}
                    loading={loading}
                    selectable
                    onSelectionChange={(ids) => setSelectedIds(ids as string[])}
                    exportFilename="categories"
                    emptyState={
                        <EmptyState
                            icon={Grid}
                            title="No categories found"
                            description="Try adjusting your filters or add your first category"
                            action={{
                                label: "Add Category",
                                onClick: () => router.push("/admin/categories/new"),
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
                title="Delete Category"
                description="Are you sure you want to delete this category? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
            <ConfirmDialog
                open={bulkDeleteDialog}
                onOpenChange={setBulkDeleteDialog}
                onConfirm={handleBulkDelete}
                title="Delete Categories"
                description={`Are you sure you want to delete ${selectedIds.length} categories? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

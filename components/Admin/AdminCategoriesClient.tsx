"use client";

import React, { useState } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Templates, Plus } from "@/components/ui/svgs/Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    categories: Category[];
}

export default function AdminCategoriesClient({ categories }: AdminCategoriesClientProps) {
    const router = useRouter();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const activeCount = categories.filter((c) => c.isActive).length;
    const totalTemplates = categories.reduce((sum, c) => sum + (c.templateCount || 0), 0);

    const handleDelete = async (categoryId: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete category");

            toast.success("Category deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete category");
        }
    };

    const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) throw new Error("Failed to update category");

            toast.success(`Category ${!currentStatus ? "activated" : "deactivated"}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update category");
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
                    className={
                        category.isActive
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
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
                            onEdit: () => router.push(`/admin/categories/${category._id}/edit`),
                            onDelete: () => handleDelete(category._id)
                        }),
                        {
                            label: category.isActive ? "Deactivate" : "Activate",
                            onClick: () => handleToggleStatus(category._id, category.isActive),
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ];

    const statCards = [
        {
            label: "Total Categories",
            value: categories.length,
            subtext: `${activeCount} active`,
            icon: Templates,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Active Categories",
            value: activeCount,
            subtext: `${((activeCount / categories.length) * 100).toFixed(0)}% of total`,
            icon: Templates,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "Total Templates",
            value: totalTemplates,
            subtext: `${(totalTemplates / categories.length).toFixed(0)} avg per category`,
            icon: Templates,
            gradient: "from-blue-500 to-cyan-500",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Categories Management"
                description={`${categories.length} total categories`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Categories" },
                ]}
                actions={
                    <Button onClick={() => router.push("/admin/categories/new")} className="bg-primary cursor-pointer hover:bg-primary/90" aria-label="Add new category">
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add Category
                    </Button>
                }
            />

            <section aria-label="Category statistics">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </section>

            <DataTable
                columns={columns}
                data={categories}
                keyExtractor={(category) => category._id}
                selectable
                onSelectionChange={setSelectedIds}
                exportFilename="categories"
                emptyState={
                    <EmptyState
                        icon={Templates}
                        title="No categories yet"
                        description="Categories will appear here once added"
                    />
                }
            />
        </div>
    );
}

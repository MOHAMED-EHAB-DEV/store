"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { Templates, Plus, Download, Eye } from "@/components/ui/svgs/Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ICategory, ITemplate } from "@/types";

interface AdminTemplatesClientProps {
    templates: ITemplate[];
    categories: ICategory[];
}

export default function AdminTemplatesClient({ templates, categories }: AdminTemplatesClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalDownloads = templates.reduce((sum, t) => sum + (t.downloads || 0), 0);
        const premiumCount = templates.filter((t) => t.price !== 0).length;
        const activeCount = templates.filter((t) => t.isActive).length;

        return {
            total: templates.length,
            premium: premiumCount,
            active: activeCount,
            totalDownloads,
        };
    }, [templates]);

    // Filter options
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

    // Filtered templates
    const filteredTemplates = useMemo(() => {
        let result = templates;

        // Search filter
        if (searchQuery) {
            result = result.filter(
                (template) =>
                    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (filters.category) {
            result = result.filter((template) => template.categories.some((cat) => typeof cat === "object" ? cat._id === filters.category : cat === filters.category));
        }

        // Tier filter
        if (filters.tier) {
            result = result.filter((template) =>
                filters.tier === "premium" ? template.price !== 0 : template.price === 0
            );
        }

        // Status filter
        if (filters.status) {
            result = result.filter((template) =>
                filters.status === "active" ? template.isActive : !template.isActive
            );
        }

        return result;
    }, [templates, searchQuery, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    const handleDelete = async (templateId: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;

        try {
            const response = await fetch(`/api/admin/templates/${templateId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete template");

            toast.success("Template deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete template");
        }
    };

    const handleToggleStatus = async (templateId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/templates/${templateId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) throw new Error("Failed to update template");

            toast.success(`Template ${!currentStatus ? "activated" : "deactivated"}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update template");
        }
    };

    // Table columns
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
            sortable: true,
            render: (template) => (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {typeof template.categories[0] === "object" ? template.categories?.[0].name : "Uncategorized"}
                </Badge>
            ),
        },
        {
            key: "price",
            label: "Price",
            sortable: true,
            render: (template) => (
                <Badge
                    className={
                        template.price !== 0
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    }
                >
                    {template.price}
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
                    className={
                        template.isActive
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
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
                <time className="text-sm text-muted-foreground" dateTime={template.createdAt as unknown as string}>
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
                            onView: undefined,
                            onEdit: () => router.push(`/admin/templates/${template._id}/edit`),
                            onDelete: () => handleDelete(template._id)
                        }),
                        {
                            label: template.isActive ? "Deactivate" : "Activate",
                            onClick: () => handleToggleStatus(template._id, template.isActive),
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ];

    const statCards = [
        {
            label: "Total Templates",
            value: stats.total,
            subtext: `${stats.active} active`,
            icon: Templates,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Premium Templates",
            value: stats.premium,
            subtext: `${((stats.premium / stats.total) * 100).toFixed(0)}% of total`,
            icon: Templates,
            gradient: "from-amber-500 to-orange-500",
        },
        {
            label: "Total Downloads",
            value: stats.totalDownloads,
            subtext: `${(stats.totalDownloads / stats.total).toFixed(0)} avg per template`,
            icon: Download,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "Categories",
            value: categories.length,
            subtext: "Active categories",
            icon: Templates,
            gradient: "from-blue-500 to-cyan-500",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Templates Management"
                description={`${templates.length} total templates`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Templates" },
                ]}
                actions={
                    <Button className="bg-primary hover:bg-primary/90" aria-label="Add new template">
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        Add Template
                    </Button>
                }
            />

            {/* Stats Grid */}
            <section aria-label="Template statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </section>

            {/* Search and Filters */}
            <SearchFilterBar
                searchPlaceholder="Search templates by title or description..."
                onSearchChange={setSearchQuery}
                filters={filterOptions}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                onClearFilters={handleClearFilters}
            />

            {/* Templates Table */}
            {filteredTemplates.length === 0 && (searchQuery || Object.keys(filters).length > 0) ? (
                <EmptyState
                    icon={Templates}
                    title="No templates found"
                    description="Try adjusting your search or filters"
                    action={{
                        label: "Clear Filters",
                        onClick: handleClearFilters,
                    }}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredTemplates}
                    keyExtractor={(template) => template._id}
                    selectable
                    onSelectionChange={setSelectedIds}
                    exportFilename="templates"
                    emptyState={
                        <EmptyState
                            icon={Templates}
                            title="No templates yet"
                            description="Templates will appear here once added"
                        />
                    }
                />
            )}
        </div>
    );
}

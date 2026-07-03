"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { FileText } from "@/components/ui/svgs/icons/FileText";
import { Plus } from "@/components/ui/svgs/icons/Plus";
import { Eye } from "@/components/ui/svgs/icons/Eye";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sonnerToast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Link from "next/link";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    author: { _id: string; name: string };
    tags?: string[];
    isPublished: boolean;
    views?: number;
    createdAt: string;
}

interface AdminBlogsClientProps {
    initialData: Blog[];
    stats: {
        total: number;
        published: number;
        drafts: number;
        totalViews: number;
    };
    pagination: any;
    searchParams: any;
}

export default function AdminBlogsClient({
    initialData,
    stats,
    pagination,
    searchParams,
}: AdminBlogsClientProps) {
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
            key: "status",
            label: "Status",
            options: [
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
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
            const res = await fetch(`/api/admin/blogs/${deleteDialog.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success("Blog post deleted successfully");
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete blog post");
            }
        } catch (error) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleTogglePublish = async (blog: Blog) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/blogs/${blog._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !blog.isPublished }),
            });
            const data = await res.json();
            if (data.success) {
                sonnerToast.success(`Blog ${!blog.isPublished ? "published" : "unpublished"} successfully`);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update blog post");
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
            const response = await fetch("/api/admin/blogs/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blogIds: selectedIds }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} posts deleted successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete posts");
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
            const response = await fetch("/api/admin/blogs/bulk-update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blogIds: selectedIds, updates: { isPublished } }),
            });

            const data = await response.json();
            if (data.success) {
                sonnerToast.success(`${selectedIds.length} posts updated successfully`);
                setSelectedIds([]);
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to update posts");
            }
        } catch (error: any) {
            sonnerToast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const columns: Column<Blog>[] = [
        {
            key: "title",
            label: "Title",
            sortable: true,
            render: (blog) => (
                <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{blog.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{blog.slug}</p>
                </div>
            ),
        },
        {
            key: "author",
            label: "Author",
            render: (blog) => (
                <span className="text-sm text-muted-foreground">{blog.author?.name || "Unknown"}</span>
            ),
        },
        {
            key: "views",
            label: "Views",
            sortable: true,
            render: (blog) => (
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-white">{blog.views || 0}</span>
                </div>
            ),
        },
        {
            key: "isPublished",
            label: "Status",
            sortable: true,
            render: (blog) => (
                <Badge
                    variant="outline"
                    className={
                        blog.isPublished
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }
                >
                    {blog.isPublished ? "Published" : "Draft"}
                </Badge>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            sortable: true,
            render: (blog) => (
                <time className="text-sm text-muted-foreground" dateTime={blog.createdAt}>
                    {new Date(blog.createdAt).toLocaleDateString()}
                </time>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (blog) => (
                <ActionDropdown
                    actions={[
                        {
                            label: "View Post",
                            icon: Eye,
                            onClick: () => window.open(`/blog/${blog.slug}`, "_blank"),
                        },
                        ...createDefaultActions({
                            onEdit: () => router.push(`/admin/blogs/edit/${blog._id}`),
                            onDelete: () => setDeleteDialog({ open: true, id: blog._id })
                        }),
                        {
                            label: blog.isPublished ? "Unpublish" : "Publish",
                            onClick: () => handleTogglePublish(blog),
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ];

    const statCardsData = [
        {
            label: "Total Posts",
            value: stats.total,
            icon: FileText,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Published",
            value: stats.published,
            icon: FileText,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "Drafts",
            value: stats.drafts,
            icon: FileText,
            gradient: "from-amber-500 to-orange-500",
        },
        {
            label: "Total Views",
            value: stats.totalViews,
            icon: Eye,
            gradient: "from-blue-500 to-cyan-500",
        },
    ];

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Blogs Management"
                description="Manage blog posts and content"
                breadcrumbs={[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Blogs" },
                ]}
                actions={
                    <Button
                        variant="default"
                        className="bg-primary hover:bg-primary/90"
                        asChild
                    >
                        <Link href="/admin/blogs/new">
                            <Plus className="w-4 h-4 mr-2" />
                            New Post
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
                    searchPlaceholder="Search blogs by title or excerpt..."
                    onSearchChange={(val) => updateQuery({ search: val })}
                    filters={filterOptions}
                    onFilterChange={(key, val) => updateQuery({ [key]: val })}
                    activeFilters={{
                        status: queryParams.get("status") || "",
                    }}
                    onClearFilters={() => updateQuery({ status: "", search: "" })}
                />

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between animate-in slide-in-from-top-2">
                        <span className="text-sm text-white">
                            {selectedIds.length} post{selectedIds.length !== 1 ? "s" : ""} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusChange(true)}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                                disabled={loading}
                            >
                                Publish
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkStatusChange(false)}
                                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
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
                    keyExtractor={(blog) => blog._id}
                    loading={loading}
                    selectable
                    onSelectionChange={(ids) => setSelectedIds(ids as string[])}
                    exportFilename="blogs"
                    emptyState={
                        <EmptyState
                            icon={FileText}
                            title="No blog posts found"
                            description="Try adjusting your filters or create your first post"
                            action={{
                                label: "New Post",
                                onClick: () => router.push("/admin/blogs/new"),
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
                title="Delete Blog Post"
                description="Are you sure you want to delete this blog post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
            <ConfirmDialog
                open={bulkDeleteDialog}
                onOpenChange={setBulkDeleteDialog}
                onConfirm={handleBulkDelete}
                title="Delete Posts"
                description={`Are you sure you want to delete ${selectedIds.length} posts? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

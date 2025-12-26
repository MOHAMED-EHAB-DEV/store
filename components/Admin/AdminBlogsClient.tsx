"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import SearchFilterBar, { FilterOption } from "@/components/Dashboard/shared/SearchFilterBar";
import DataTable, { Column } from "@/components/Dashboard/shared/DataTable";
import ActionDropdown, { createDefaultActions } from "@/components/Dashboard/shared/ActionDropdown";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import StatCard from "@/components/Dashboard/shared/StatCard";
import { FileText, Plus, Eye } from "@/components/ui/svgs/Icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    author: { _id: string; name: string };
    category?: string;
    tags?: string[];
    isPublished: boolean;
    views?: number;
    createdAt: string;
    publishedAt?: string;
}

interface AdminBlogsClientProps {
    blogs: Blog[];
}

export default function AdminBlogsClient({ blogs }: AdminBlogsClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const stats = useMemo(() => {
        const publishedCount = blogs.filter((b) => b.isPublished).length;
        const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
        const draftCount = blogs.length - publishedCount;

        return {
            total: blogs.length,
            published: publishedCount,
            drafts: draftCount,
            totalViews,
        };
    }, [blogs]);

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

    const filteredBlogs = useMemo(() => {
        let result = blogs;

        if (searchQuery) {
            result = result.filter(
                (blog) =>
                    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filters.status) {
            result = result.filter((blog) =>
                filters.status === "published" ? blog.isPublished : !blog.isPublished
            );
        }

        return result;
    }, [blogs, searchQuery, filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchQuery("");
    };

    const handleDelete = async (blogId: string) => {
        if (!confirm("Are you sure you want to delete this blog post?")) return;

        try {
            const response = await fetch(`/api/admin/blogs/${blogId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete blog");

            toast.success("Blog deleted successfully");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete blog");
        }
    };

    const handleTogglePublish = async (blogId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/blogs/${blogId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublished: !currentStatus }),
            });

            if (!response.ok) throw new Error("Failed to update blog");

            toast.success(`Blog ${!currentStatus ? "published" : "unpublished"}`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Failed to update blog");
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
            key: "category",
            label: "Category",
            render: (blog) => (
                <span className="text-sm text-muted-foreground">{blog.category || "Uncategorized"}</span>
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
                    className={
                        blog.isPublished
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
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
                            label: "View",
                            icon: Eye,
                            onClick: () => window.open(`/blog/${blog.slug}`, "_blank"),
                        },
                        ...createDefaultActions({
                            onEdit: () => router.push(`/admin/blogs/${blog._id}/edit`),
                            onDelete: () => handleDelete(blog._id)
                        }),
                        {
                            label: blog.isPublished ? "Unpublish" : "Publish",
                            onClick: () => handleTogglePublish(blog._id, blog.isPublished),
                            separator: true,
                        },
                    ]}
                />
            ),
        },
    ];

    const statCards = [
        {
            label: "Total Posts",
            value: stats.total,
            subtext: `${stats.published} published`,
            icon: FileText,
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Published",
            value: stats.published,
            subtext: `${((stats.published / stats.total) * 100).toFixed(0)}% of total`,
            icon: FileText,
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "Drafts",
            value: stats.drafts,
            subtext: "Unpublished posts",
            icon: FileText,
            gradient: "from-yellow-500 to-orange-500",
        },
        {
            label: "Total Views",
            value: stats.totalViews,
            subtext: `${(stats.totalViews / stats.total).toFixed(0)} avg per post`,
            icon: Eye,
            gradient: "from-blue-500 to-cyan-500",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Blogs Management"
                description={`${blogs.length} total blog posts`}
                breadcrumbs={[
                    { label: "Admin", href: "/admin" },
                    { label: "Blogs" },
                ]}
                actions={
                    <Button className="bg-primary hover:bg-primary/90" aria-label="Create new blog post">
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                        New Post
                    </Button>
                }
            />

            <section aria-label="Blog statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>
            </section>

            <SearchFilterBar
                searchPlaceholder="Search blogs by title or excerpt..."
                onSearchChange={setSearchQuery}
                filters={filterOptions}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
                onClearFilters={handleClearFilters}
            />

            {filteredBlogs.length === 0 && (searchQuery || Object.keys(filters).length > 0) ? (
                <EmptyState
                    icon={FileText}
                    title="No blogs found"
                    description="Try adjusting your search or filters"
                    action={{
                        label: "Clear Filters",
                        onClick: handleClearFilters,
                    }}
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredBlogs}
                    keyExtractor={(blog) => blog._id}
                    selectable
                    onSelectionChange={setSelectedIds}
                    exportFilename="blogs"
                    emptyState={
                        <EmptyState
                            icon={FileText}
                            title="No blog posts yet"
                            description="Blog posts will appear here once created"
                        />
                    }
                />
            )}
        </div>
    );
}

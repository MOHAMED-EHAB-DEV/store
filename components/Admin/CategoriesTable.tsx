"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import Link from "next/link";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface CategoriesTableProps {
    categories: any[];
    pagination: any;
    searchParams: { [key: string]: string | undefined };
}

export default function CategoriesTable({ categories, pagination, searchParams }: CategoriesTableProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    const handleDelete = (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        setDeleting(deleteDialog.id);
        try {
            const response = await fetch(`/api/admin/categories/${deleteDialog.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            sonnerToast.success("Category deleted successfully");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to delete category");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Slug</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Templates</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Order</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No categories found
                                </td>
                            </tr>
                        ) : (
                            categories.map((category: any) => (
                                <tr key={category._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <p className="text-white font-medium">{category.name}</p>
                                        {category.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-1">{category.description}</p>
                                        )}
                                    </td>
                                    <td className="p-4 text-muted-foreground text-sm">{category.slug}</td>
                                    <td className="p-4">
                                        <span className="text-white">{category.templateCount || 0}</span>
                                    </td>
                                    <td className="p-4 text-muted-foreground">{category.sortOrder}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${category.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                                            {category.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/categories/edit/${category._id}`}
                                                className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(category._id)}
                                                disabled={deleting === category._id}
                                                className="text-red-400 hover:text-red-300 hover:underline text-sm font-medium disabled:opacity-50 transition-colors"
                                            >
                                                {deleting === category._id ? "..." : "Delete"}
                                            </button>
                                        </div>
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
                                href={`/admin/categories?page=${pagination.page - 1}`}
                                className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-sm text-white hover:bg-white/15 transition-colors font-medium"
                            >
                                Previous
                            </Link>
                        )}
                        {pagination.page < pagination.pages && (
                            <Link
                                href={`/admin/categories?page=${pagination.page + 1}`}
                                className="px-3 py-1.5 bg-white/10 border border-white/20 rounded text-sm text-white hover:bg-white/15 transition-colors font-medium"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
                onConfirm={confirmDelete}
                title="Delete Category"
                description="Are you sure you want to delete this category? This will deactivate it and may affect associated templates."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

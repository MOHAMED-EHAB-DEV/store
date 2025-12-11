"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import Link from "next/link";
import Image from "next/image";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface TemplatesTableProps {
    templates: any[];
    pagination: any;
    searchParams: { [key: string]: string | undefined };
}

export default function TemplatesTable({ templates, pagination, searchParams }: TemplatesTableProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    const handleDelete = (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        setDeleting(deleteDialog.id);
        try {
            const response = await fetch(`/api/template/${deleteDialog.id}`, {
                method: "DELETE",
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            sonnerToast.success("Template deleted successfully");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to delete template");
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setToggling(id);
        try {
            const response = await fetch(`/api/template/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message);

            sonnerToast.success(`Template ${!currentStatus ? "activated" : "deactivated"}`);
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to toggle template");
        } finally {
            setToggling(null);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelected(templates.map(t => t._id));
        } else {
            setSelected([]);
        }
    };

    const handleSelect = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkActivate = async () => {
        if (selected.length === 0) return;

        try {
            await Promise.all(
                selected.map(id =>
                    fetch(`/api/template/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isActive: true }),
                    })
                )
            );
            sonnerToast.success(`${selected.length} templates activated`);
            setSelected([]);
            router.refresh();
        } catch (error: any) {
            sonnerToast.error("Failed to activate templates");
        }
    };

    const handleBulkDeactivate = async () => {
        if (selected.length === 0) return;

        try {
            await Promise.all(
                selected.map(id =>
                    fetch(`/api/template/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isActive: false }),
                    })
                )
            );
            sonnerToast.success(`${selected.length} templates deactivated`);
            setSelected([]);
            router.refresh();
        } catch (error: any) {
            sonnerToast.error("Failed to deactivate templates");
        }
    };

    return (
        <div className="space-y-4">
            {/* Bulk Actions */}
            {selected.length > 0 && (
                <div className="glass rounded-xl p-4 flex items-center gap-4">
                    <span className="text-white font-medium">{selected.length} selected</span>
                    <button
                        onClick={handleBulkActivate}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-lg shadow-green-500/20"
                    >
                        Activate
                    </button>
                    <button
                        onClick={handleBulkDeactivate}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium shadow-lg shadow-orange-500/20"
                    >
                        Deactivate
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12">
                                    <input
                                        type="checkbox"
                                        checked={selected.length === templates.length && templates.length > 0}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4"
                                    />
                                </th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Template</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Downloads</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rating</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {templates.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No templates found
                                    </td>
                                </tr>
                            ) : (
                                templates.map((template: any) => (
                                    <tr key={template._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(template._id)}
                                                onChange={() => handleSelect(template._id)}
                                                className="w-4 h-4"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {template.thumbnail && (
                                                    <Image
                                                        src={template.thumbnail}
                                                        alt={template.title}
                                                        width={60}
                                                        height={40}
                                                        className="rounded object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-white font-medium line-clamp-1">{template.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 capitalize">
                                                {template.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white">
                                            {template.isPaid ? `$${template.price}` : "Free"}
                                        </td>
                                        <td className="p-4 text-muted-foreground">{template.downloads || 0}</td>
                                        <td className="p-4 text-muted-foreground">
                                            {template.averageRating ? template.averageRating.toFixed(1) : "N/A"}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${template.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                                                {template.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/admin/templates/edit/${template._id}`}
                                                    className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleActive(template._id, template.isActive)}
                                                    disabled={toggling === template._id}
                                                    className="text-amber-400 hover:text-amber-300 hover:underline text-sm font-medium disabled:opacity-50 transition-colors"
                                                >
                                                    {toggling === template._id ? "..." : template.isActive ? "Deactivate" : "Activate"}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template._id)}
                                                    disabled={deleting === template._id}
                                                    className="text-red-400 hover:text-red-300 hover:underline text-sm font-medium disabled:opacity-50 transition-colors"
                                                >
                                                    {deleting === template._id ? "..." : "Delete"}
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
                                    href={`/admin/templates?page=${pagination.page - 1}&type=${searchParams.type || ""}&builtWith=${searchParams.builtWith || ""}&isActive=${searchParams.isActive || ""}`}
                                    className="px-3 py-1 bg-white/5 rounded text-sm text-white hover:bg-white/10"
                                >
                                    Previous
                                </Link>
                            )}
                            {pagination.page < pagination.pages && (
                                <Link
                                    href={`/admin/templates?page=${pagination.page + 1}&type=${searchParams.type || ""}&builtWith=${searchParams.builtWith || ""}&isActive=${searchParams.isActive || ""}`}
                                    className="px-3 py-1 bg-white/5 rounded text-sm text-white hover:bg-white/10"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, id: null })}
                onConfirm={confirmDelete}
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
}

'use client';

import { useState } from "react";
import { Search } from "@/components/ui/svgs/icons/Search";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { formatDate } from "@/lib/utils";
import { Edit } from "@/components/ui/svgs/icons/Edit";
import { Trash2 } from "@/components/ui/svgs/icons/Trash2";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface BlogType {
    _id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    views: number;
    createdAt: string;
    author: {
        name: string;
        avatar?: string;
    }
}

const Blogs = ({ initialData }: { initialData: any[] }) => {
    const [blogs, setBlogs] = useState<BlogType[]>(initialData);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });
    const router = useRouter();

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        const id = deleteDialog.id;

        try {
            const res = await fetch(`/api/blogs/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                sonnerToast.success("Blog post deleted");
                setBlogs(prev => prev.filter(b => b._id !== id));
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Failed to delete");
            }
        } catch (error) {
            console.error(error);
            sonnerToast.error("An error occurred");
        } finally {
            setDeleteDialog({ open: false, id: null });
        }
    };

    return (
        <div className="w-full">
            <div className="flex gap-6 justify-between items-center mb-6">
                <div className="w-full flex-1">
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        isRequired
                        startContent={<Search className="w-4 h-4 text-gray-400" />}
                        isClearable
                        onClear={() => setSearchQuery("")}
                        classNames={{
                            inputWrapper: "bg-white/5 border-white/10 rounded-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent"
                        }}
                    />
                </div>
                <Link href="/admin/blogs/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition font-medium">
                    Create New Post
                </Link>
            </div>

            <div className="rounded-lg overflow-hidden border border-gray-800">
                <table className="w-full text-left text-gray-300">
                    <thead className="text-gray-400 uppercase text-xs border-b border-gray-800">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Title</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Views</th>
                            <th className="px-6 py-4 font-semibold">Created At</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {blogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No blog posts found.
                                </td>
                            </tr>
                        ) : (
                            blogs.map((blog) => (
                                <tr key={blog._id} className="hover:bg-gray-800/30 transition group">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {blog.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${blog.isPublished ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}>
                                            {blog.isPublished ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{blog.views}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {formatDate(blog.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3 opacity-100">
                                            <Link href={`/admin/blogs/edit/${blog._id}`} className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button onClick={() => setDeleteDialog({ open: true, id: blog._id })} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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
        </div>
    );
};

export default Blogs;

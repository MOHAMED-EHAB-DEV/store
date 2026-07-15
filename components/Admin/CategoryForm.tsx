"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { CATEGORY_ICONS } from "@/components/ui/svgs/CategoriesIcons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryFormProps {
    initialData?: any;
    isEdit?: boolean;
    parentCategories?: any[];
}

export default function CategoryForm({ initialData, isEdit = false, parentCategories = [] }: CategoryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        slug: initialData?.slug || "",
        sortOrder: initialData?.sortOrder || 0,
        parentCategory: initialData?.parentCategory || "",
        isActive: initialData?.isActive ?? true,
        icon: initialData?.icon || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked :
                type === "number" ? parseInt(value) || 0 : value
        }));
    };

    // Auto-generate slug from name
    const generateSlug = () => {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            sonnerToast.error("Category name is required");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                parentCategory: formData.parentCategory || null,
            };

            const url = isEdit
                ? `/api/admin/categories/${initialData._id}`
                : "/api/admin/categories";

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to save category");
            }

            sonnerToast.success(isEdit ? "Category updated successfully" : "Category created successfully");
            router.push("/admin/categories");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Category Details</h3>

                {/* Name */}
                <div>
                    <Input
                        label="Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={() => !formData.slug && generateSlug()}
                        placeholder="Enter category name..."
                        isRequired
                        classNames={{
                            inputWrapper: "bg-white/5 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-primary"
                        }}
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Slug</label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="category-slug"
                            classNames={{
                                inputWrapper: "flex-1 bg-white/5 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-primary"
                            }}
                        />
                        <button
                            type="button"
                            onClick={generateSlug}
                            className="px-4 py-2 h-12 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Generate
                        </button>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <Textarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter category description..."
                        rows={3}
                        classNames={{
                            inputWrapper: "bg-white/5 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-primary"
                        }}
                    />
                </div>

                {/* Parent Category & Sort Order */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Parent Category</label>
                        <select
                            name="parentCategory"
                            value={formData.parentCategory}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">None (Top Level)</option>
                            {parentCategories?.filter(c => c._id !== initialData?._id)?.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Input
                            label="Sort Order"
                            type="number"
                            name="sortOrder"
                            value={formData.sortOrder}
                            onChange={handleChange}
                            min={0}
                            classNames={{
                                inputWrapper: "bg-white/5 border border-white/10 rounded-lg focus-within:ring-2 focus-within:ring-primary"
                            }}
                        />
                    </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2 pt-4">
                    <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                    />
                    <label htmlFor="isActive" className="text-sm text-muted-foreground cursor-pointer">
                        Active (visible in navigation)
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

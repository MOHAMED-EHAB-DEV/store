"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/kibo-ui/dropzone";
import { useUploadThing } from "@/hooks/useUploadthing";
import Image from "next/image";

interface TemplateFormProps {
    initialData?: any;
    isEdit?: boolean;
    categories?: any[];
}

export default function TemplateForm({ initialData, isEdit = false, categories = [] }: TemplateFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        demoLink: initialData?.demoLink || "",
        price: initialData?.price || 0,
        content: initialData?.content || "",
        categories: initialData?.categories?.map((c: any) => c._id || c) || [],
        tags: initialData?.tags?.join(", ") || "",
        builtWith: initialData?.builtWith || "next.js",
        type: initialData?.type || "coded",
        isPaid: initialData?.isPaid ?? true,
        isActive: initialData?.isActive ?? true,
    });
    const [thumbnail, setThumbnail] = useState<string | undefined>(initialData?.thumbnail);
    const [fileKey, setFileKey] = useState<string | undefined>(initialData?.fileKey);

    const { startUpload: uploadThumbnail, isUploading: uploadingThumbnail } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res?.[0]?.ufsUrl) {
                setThumbnail(res[0].ufsUrl);
            }
        },
        onUploadError: (error) => {
            sonnerToast.error(error.message || "Failed to upload thumbnail");
        },
    });

    const { startUpload: uploadFile, isUploading: uploadingFile } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res?.[0]?.key) {
                setFileKey(res[0].key);
            }
        },
        onUploadError: (error) => {
            sonnerToast.error(error.message || "Failed to upload file");
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked :
                type === "number" ? parseFloat(value) || 0 : value
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, categories: selected }));
    };

    const handleThumbnail = async (files: File[]) => {
        if (files.length > 0) {
            await uploadThumbnail(files);
        }
    };

    const handleFile = async (files: File[]) => {
        if (files.length > 0) {
            await uploadFile(files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim() || !thumbnail) {
            sonnerToast.error("Title, description, and thumbnail are required");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
                thumbnail,
                fileKey,
            };

            const url = isEdit
                ? `/api/template/${initialData._id}`
                : "/api/admin/templates";

            const response = await fetch(url, {
                method: isEdit ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to save template");
            }

            sonnerToast.success(isEdit ? "Template updated successfully" : "Template created successfully");
            router.push("/admin/templates");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to save template");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Template Details</h3>

                {/* Title */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter template title..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter template description..."
                        rows={4}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                        required
                    />
                </div>

                {/* Demo Link & Price */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Demo Link</label>
                        <input
                            type="url"
                            name="demoLink"
                            value={formData.demoLink}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Price (USD)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Content/Features</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Detailed content or features list..."
                        rows={6}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                    />
                </div>

                {/* Categories & Tags */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Categories</label>
                        <select
                            multiple
                            value={formData.categories}
                            onChange={handleCategoryChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            size={4}
                        >
                            {categories.map((cat: any) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Tags (comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="react, nextjs, modern"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Built With & Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Built With</label>
                        <select
                            name="builtWith"
                            value={formData.builtWith}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="framer">Framer</option>
                            <option value="figma">Figma</option>
                            <option value="vite">Vite</option>
                            <option value="next.js">Next.js</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="framer">Framer</option>
                            <option value="coded">Coded</option>
                            <option value="figma">Figma</option>
                        </select>
                    </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isPaid"
                            id="isPaid"
                            checked={formData.isPaid}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isPaid" className="text-sm text-muted-foreground">
                            Paid Template
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isActive" className="text-sm text-muted-foreground">
                            Active (visible to users)
                        </label>
                    </div>
                </div>
            </div>

            {/* Thumbnail */}
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Thumbnail *</h3>

                {thumbnail ? (
                    <div className="relative">
                        <Image
                            src={thumbnail}
                            alt="Thumbnail"
                            width={600}
                            height={400}
                            className="rounded-lg object-cover w-full max-h-64"
                        />
                        <button
                            type="button"
                            onClick={() => setThumbnail(undefined)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <Dropzone
                        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                        maxSize={8 * 1024 * 1024}
                        maxFiles={1}
                        onDrop={handleThumbnail}
                        disabled={uploadingThumbnail}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                    </Dropzone>
                )}
            </div>

            {/* Template File */}
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Template File (Optional)</h3>
                <p className="text-sm text-muted-foreground">Upload template files (zip, etc.)</p>

                {fileKey ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 text-sm">File uploaded: {fileKey}</p>
                        <button
                            type="button"
                            onClick={() => setFileKey(undefined)}
                            className="mt-2 text-xs text-red-400 hover:underline"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <Dropzone
                        accept={{ "application/zip": [".zip"], "application/x-rar-compressed": [".rar"] }}
                        maxSize={50 * 1024 * 1024}
                        maxFiles={1}
                        onDrop={handleFile}
                        disabled={uploadingFile}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                    </Dropzone>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading || uploadingThumbnail || uploadingFile}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? "Saving..." : isEdit ? "Update Template" : "Create Template"}
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

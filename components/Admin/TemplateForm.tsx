"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
        type: initialData?.type || "coded",
        isPaid: initialData?.isPaid ?? true,
        isActive: initialData?.isActive ?? true,
    });
    const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(initialData?.thumbnail);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const [demoVideoUrl, setDemoVideoUrl] = useState<string | undefined>(initialData?.demoVideo);
    const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null);

    const [fileKeyStr, setFileKeyStr] = useState<string | undefined>(initialData?.fileKey);
    const [templateFile, setTemplateFile] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value
        }));
    };

    const handleThumbnail = (files: File[]) => {
        if (files.length > 0) {
            setThumbnailFile(files[0]);
            setThumbnailUrl(URL.createObjectURL(files[0]));
        }
    };

    const handleDemoVideo = (files: File[]) => {
        if (files.length > 0) {
            setDemoVideoFile(files[0]);
            setDemoVideoUrl(URL.createObjectURL(files[0]));
        }
    };

    const handleFile = (files: File[]) => {
        if (files.length > 0) {
            setTemplateFile(files[0]);
            setFileKeyStr(files[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.description.trim() || (!thumbnailUrl && !thumbnailFile)) {
            sonnerToast.error("Title, description, and thumbnail are required");
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'categories' || key === 'tags') return;
                submitData.append(key, value.toString());
            });

            formData.categories.forEach((cat: string) => {
                submitData.append('categories', cat);
            });

            const tagsList = formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
            tagsList.forEach((tag: string) => {
                submitData.append('tags', tag);
            });

            if (thumbnailUrl && !thumbnailFile) {
                submitData.append('thumbnailUrl', thumbnailUrl);
            }
            if (demoVideoUrl && !demoVideoFile) {
                submitData.append('demoVideoUrl', demoVideoUrl);
            }
            if (fileKeyStr && !templateFile) {
                submitData.append('fileKeyStr', fileKeyStr);
            }

            if (thumbnailFile) {
                submitData.append('thumbnailFile', thumbnailFile);
            }
            if (demoVideoFile) {
                submitData.append('demoVideoFile', demoVideoFile);
            }
            if (templateFile) {
                submitData.append('templateFile', templateFile);
            }

            const url = isEdit
                ? `/api/admin/templates/${initialData._id}`
                : "/api/admin/templates";

            const response = await fetch(url, {
                method: isEdit ? "PATCH" : "POST",
                body: submitData,
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
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter template title..."
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Description *</label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter template description..."
                        rows={4}
                        required
                    />
                </div>

                {/* Demo Link & Price */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Demo Link</label>
                        <Input
                            type="url"
                            name="demoLink"
                            value={formData.demoLink}
                            onChange={handleChange}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Price (USD)</label>
                        <Input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min={0}
                            step={0.01}
                        />
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Content/Features</label>
                    <Textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Detailed content or features list..."
                        rows={6}
                    />
                </div>

                {/* Categories & Tags */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {categories.map((cat: any) => {
                                const isSelected = formData.categories.includes(cat._id);
                                return (
                                    <Badge
                                        key={cat._id}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer transition-all",
                                            isSelected
                                                ? "bg-primary/20 text-white border-white"
                                                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:text-white"
                                        )}
                                        onClick={() => {
                                            const newCategories = isSelected
                                                ? formData.categories.filter((id: string) => id !== cat._id)
                                                : [...formData.categories, cat._id];
                                            setFormData(prev => ({ ...prev, categories: newCategories }));
                                        }}
                                    >
                                        {cat.name}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Tags (comma-separated)</label>
                        <Input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            placeholder="react, nextjs, modern"
                        />
                    </div>
                </div>

                {/* Type */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Type</label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#15161b] border-white/10 text-white">
                                <SelectItem value="framer">Framer</SelectItem>
                                <SelectItem value="coded">Coded</SelectItem>
                                <SelectItem value="figma">Figma</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Checkboxes */}
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="isPaid"
                            checked={formData.isPaid}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPaid: !!checked }))}
                        />
                        <label htmlFor="isPaid" className="text-sm text-muted-foreground cursor-pointer">
                            Paid Template
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                        />
                        <label htmlFor="isActive" className="text-sm text-muted-foreground cursor-pointer">
                            Active (visible to users)
                        </label>
                    </div>
                </div>
            </div>

            {/* Thumbnail */}
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Thumbnail *</h3>

                {thumbnailUrl ? (
                    <div className="relative">
                        <img
                            src={thumbnailUrl}
                            alt="Thumbnail"
                            className="rounded-lg object-contain w-full max-h-64"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                                setThumbnailUrl(undefined);
                                setThumbnailFile(null);
                            }}
                            className="absolute top-2 right-2 rounded-full size-8"
                        >
                            ✕
                        </Button>
                    </div>
                ) : (
                    <Dropzone
                        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                        maxSize={8 * 1024 * 1024}
                        maxFiles={1}
                        onDrop={handleThumbnail}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                    </Dropzone>
                )}
            </div>

            {/* Demo Video */}
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Demo Video (Optional)</h3>
                <p className="text-sm text-muted-foreground">Upload a hover preview video for this template.</p>
                {demoVideoUrl ? (
                    <div className="relative group">
                        <video
                            src={demoVideoUrl}
                            controls
                            muted
                            playsInline
                            className="rounded-lg w-full max-h-64 object-contain bg-black relative z-10 pointer-events-auto"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                                setDemoVideoUrl(undefined);
                                setDemoVideoFile(null);
                            }}
                            className="absolute top-2 right-2 rounded-full size-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            ✕
                        </Button>
                    </div>
                ) : (
                    <Dropzone
                        accept={{ "video/mp4": [".mp4"], "video/webm": [".webm"] }}
                        maxSize={100 * 1024 * 1024}
                        maxFiles={1}
                        onDrop={handleDemoVideo}
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

                {fileKeyStr ? (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 text-sm">File uploaded: {fileKeyStr}</p>
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => {
                                setFileKeyStr(undefined);
                                setTemplateFile(null);
                            }}
                            className="mt-2 h-auto p-0 text-xs text-red-400 hover:underline hover:text-red-300"
                        >
                            Remove file
                        </Button>
                    </div>
                ) : (
                    <Dropzone
                        accept={{ "application/zip": [".zip"], "application/x-rar-compressed": [".rar"] }}
                        maxSize={50 * 1024 * 1024}
                        maxFiles={1}
                        onDrop={handleFile}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                    </Dropzone>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Saving..." : isEdit ? "Update Template" : "Create Template"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="bg-white/5 border-white/10 text-white"
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}

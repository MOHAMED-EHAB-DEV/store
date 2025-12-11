"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/kibo-ui/dropzone";
import { useUploadThing } from "@/hooks/useUploadthing";
import Image from "next/image";

interface FAQFormProps {
    initialData?: any;
    isEdit?: boolean;
}

export default function FAQForm({ initialData, isEdit = false }: FAQFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        question: initialData?.question || "",
        answer: initialData?.answer || "",
        category: initialData?.category || "general",
        order: initialData?.order || 0,
        isPublished: initialData?.isPublished ?? true,
    });
    const [coverImage, setCoverImage] = useState<string | undefined>(initialData?.coverImage);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res?.[0]?.ufsUrl) {
                setCoverImage(res[0].ufsUrl);
            }
        },
        onUploadError: (error) => {
            sonnerToast.error(error.message || "Failed to upload image");
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked :
                type === "number" ? parseInt(value) || 0 : value
        }));
    };

    const handleImage = async (files: File[]) => {
        if (files.length > 0) {
            setImageFile(files[0]);
            await startUpload(files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.question.trim() || !formData.answer.trim()) {
            sonnerToast.error("Question and answer are required");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                ...formData,
                coverImage: coverImage || null,
            };

            const url = isEdit
                ? `/api/admin/faqs/${initialData._id}`
                : "/api/admin/faqs";

            const response = await fetch(url, {
                method: isEdit ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Failed to save FAQ");
            }

            sonnerToast.success(isEdit ? "FAQ updated successfully" : "FAQ created successfully");
            router.push("/admin/faqs");
            router.refresh();
        } catch (error: any) {
            sonnerToast.error(error.message || "Failed to save FAQ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">FAQ Details</h3>

                {/* Question */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Question *</label>
                    <input
                        type="text"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        placeholder="Enter the question..."
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                    />
                </div>

                {/* Answer */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Answer *</label>
                    <textarea
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        placeholder="Enter the answer..."
                        rows={6}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                        required
                    />
                </div>

                {/* Category & Order */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="general">General</option>
                            <option value="billing">Billing</option>
                            <option value="technical">Technical</option>
                            <option value="account">Account</option>
                            <option value="templates">Templates</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Display Order</label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            min={0}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isPublished"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="w-4 h-4"
                    />
                    <label htmlFor="isPublished" className="text-sm text-muted-foreground">
                        Published (visible to users)
                    </label>
                </div>
            </div>

            {/* Cover Image */}
            <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Cover Image (Optional)</h3>

                {coverImage ? (
                    <div className="relative">
                        <Image
                            src={coverImage}
                            alt="Cover"
                            width={400}
                            height={200}
                            className="rounded-lg object-cover w-full max-h-48"
                        />
                        <button
                            type="button"
                            onClick={() => setCoverImage(undefined)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <Dropzone
                        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                        maxSize={4 * 1024 * 1024}
                        maxFiles={1}
                        onDrop={handleImage}
                        disabled={isUploading}
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
                    disabled={loading || isUploading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? "Saving..." : isEdit ? "Update FAQ" : "Create FAQ"}
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

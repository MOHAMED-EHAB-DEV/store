"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

    const { startUpload, isUploading } = useCloudinaryUpload("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res?.[0]?.ufsUrl) {
                setCoverImage(res[0].ufsUrl);
            }
        },
        onUploadError: (error) => {
            sonnerToast.error(error.message || "Failed to upload image");
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? parseInt(value) || 0 : value
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
                    <Input
                        type="text"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        placeholder="Enter the question..."
                        required
                    />
                </div>

                {/* Answer */}
                <div>
                    <label className="block text-sm text-muted-foreground mb-1">Answer *</label>
                    <Textarea
                        name="answer"
                        value={formData.answer}
                        onChange={handleChange}
                        placeholder="Enter the answer..."
                        rows={6}
                        required
                    />
                </div>

                {/* Category & Order */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Category</label>
                        <Select
                            value={formData.category}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#15161b] border-white/10 text-white">
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="account">Account</SelectItem>
                                <SelectItem value="templates">Templates</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm text-muted-foreground mb-1">Display Order</label>
                        <Input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleChange}
                            min={0}
                        />
                    </div>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: !!checked }))}
                    />
                    <label htmlFor="isPublished" className="text-sm text-muted-foreground cursor-pointer">
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
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setCoverImage(undefined)}
                            className="absolute top-2 right-2 rounded-full size-8"
                        >
                            ✕
                        </Button>
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
                <Button
                    type="submit"
                    disabled={loading || isUploading}
                >
                    {loading ? "Saving..." : isEdit ? "Update FAQ" : "Create FAQ"}
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

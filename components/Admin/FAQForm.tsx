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
import { Loader2 } from "@/components/ui/svgs/icons/Loader2";
import { anyImgUrl } from "@/lib/utils/image";
import {
    Select,
    SelectItem,
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
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8 text-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Question *</label>
                    <Input
                        type="text"
                        name="question"
                        value={formData.question}
                        onChange={handleChange}
                        placeholder="Enter the question..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                        selectedKeys={formData.category ? [formData.category] : []}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Category"
                        classNames={{
                            trigger: "w-full",
                            popoverContent: "bg-[#15161b] border-white/10 text-white"
                        }}
                    >
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="templates">Templates</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </Select>
                </div>
            </div>

            <div className="w-full">
                <Textarea
                    label="Answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleChange}
                    placeholder="Enter the answer..."
                    rows={6}
                    isRequired
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Display Order</label>
                    <Input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleChange}
                        min={0}
                    />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                    <Checkbox
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: !!checked }))}
                    />
                    <label htmlFor="isPublished" className="text-sm font-medium text-gray-200 cursor-pointer">
                        Published (visible to users)
                    </label>
                </div>
            </div>

            <div className="flex flex-col justify-center gap-2">
                <label htmlFor="coverImage" className="text-gray-300 font-medium text-sm">Cover Image (Optional)</label>
                <div className="flex flex-col items-center gap-3 w-full">
                    {coverImage ? (
                        <div className="relative w-full max-w-lg">
                            <Image
                                src={coverImage.startsWith("data:") ? coverImage : anyImgUrl(coverImage || "", { width: 600, quality: 80 })}
                                alt={formData?.question || "Cover image"}
                                width={600}
                                height={300}
                                unoptimized={coverImage.startsWith("data:")}
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
                            className="hover:bg-primary bg-gray-900 border-gray-700 w-full"
                        >
                            <DropzoneEmptyState />
                            <DropzoneContent />
                        </Dropzone>
                    )}
                </div>
            </div>

            <div className="flex justify-end items-center gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="bg-white/5 border-white/10 text-white"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading || isUploading}
                    className="flex items-center"
                >
                    {(loading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Update FAQ" : "Create FAQ"}
                </Button>
            </div>
        </form>
    );
}

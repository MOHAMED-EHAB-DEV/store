"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { Loader2 } from "@/components/ui/svgs/icons/Loader2";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/dropzone";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";
import Loader from "@/components/ui/Loader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface BlogFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const BlogForm = ({ initialData, isEdit = false }: BlogFormProps) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        content: initialData?.content || "",
        excerpt: initialData?.excerpt || "",
        tags: initialData?.tags ? initialData.tags.join(", ") : "",
        isPublished: initialData?.isPublished || false,
    });
    const [image, setImage] = useState<string | undefined>(initialData?.coverImage);
    const [error, setError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImage = async (files: File[]) => {
        if (files && files.length > 0 && files[0]) {
            const file = files[0];
            const fileBase64 = await fileToBase64(file);
            setImage(fileBase64);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
                coverImage: image,
            };

            const url = isEdit ? `/api/admin/blogs/${initialData._id}` : "/api/admin/blogs";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success || res.ok) {
                sonnerToast.success(`Blog post ${isEdit ? "updated" : "created"} successfully`);
                router.push("/admin/blogs");
                router.refresh();
            } else {
                sonnerToast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            sonnerToast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8 text-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Slug (Optional)</label>
                    <Input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="Leave empty to auto-generate"
                    />
                </div>
            </div>

            <div className="w-full">
                <Textarea
                    label="Excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                />
            </div>

            <div className="w-full">
                <Textarea
                    label="Content (Markdown)"
                    description="Markdown Supported"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={15}
                    isRequired
                    classNames={{
                        input: "font-mono text-sm"
                    }}
                />
            </div>

            <div className="flex flex-col justify-center gap-2">
                <label htmlFor="image" className="text-gray-300 font-medium text-sm">Cover Image</label>
                <div className="flex flex-col items-center gap-3 w-full">
                    {image ? (
                        <div className="relative w-full max-w-lg">
                            <Image
                                src={image.startsWith("data:") ? image : anyImgUrl(image || "", { width: 600, quality: 80 })}
                                alt={formData?.title || "Cover image"}
                                width={600}
                                height={300}
                                unoptimized={image.startsWith("data:")}
                                className="rounded-lg object-cover w-full max-h-48"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => setImage(undefined)}
                                className="absolute top-2 right-2 rounded-full size-8"
                            >
                                ✕
                            </Button>
                        </div>
                    ) : (
                        <Dropzone
                            accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
                            onDrop={handleImage}
                            onError={() => {
                                setError(true);
                                setTimeout(() => setError(false), 4000);
                            }}
                            maxFiles={1}
                            className="hover:bg-primary bg-gray-900 border-gray-700 w-full"
                        >
                            <DropzoneEmptyState />
                            <DropzoneContent />
                        </Dropzone>
                    )}
                    {error &&
                        <span className="font-normal text-red-500">Something went wrong, Please try again</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <Input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="React, NextJS, Tutorial"
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

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? "Update Post" : "Create Post"}
                </Button>
            </div>
        </form>
    );
};

export default BlogForm;

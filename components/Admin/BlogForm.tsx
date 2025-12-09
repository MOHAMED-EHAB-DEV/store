'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sonnerToast } from "@/components/ui/sonner";
import { Loader2 } from "@/components/ui/svgs/Icons";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/kibo-ui/dropzone';
import { useUploadThing } from "@/hooks/useUploadthing";
import Image from "next/image";
import Loader from "@/components/ui/Loader";

interface BlogFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const BlogForm = ({ initialData, isEdit = false }: BlogFormProps) => {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        content: initialData?.content || '',
        excerpt: initialData?.excerpt || '',
        tags: initialData?.tags ? initialData.tags.join(', ') : '',
        isPublished: initialData?.isPublished || false,
    });
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [image, setImage] = useState<string | undefined>();
    const [error, setError] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));
    };

    const [filePreview, setFilePreview] = useState<string | undefined>();

    const handleImage = async (files: File[]) => {
        if (files && files.length > 0 && files[0]) {
            const file = files[0];
            const fileBase64 = await fileToBase64(file);
            setImage(fileBase64);
            setFiles([file]);
            setFilePreview(fileBase64);
        }
    };

    const { startUpload, routeConfig } = useUploadThing("profilePicture", {
        onClientUploadComplete: (res) => {
            sonnerToast.success("Image uploaded successfully!");
        },
        onUploadError: (res) => {
            sonnerToast.error("Error uploading image. Please try again.");
        },
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        setIsImageLoading(true);
        try {
            const imgRes = await startUpload([file]);
            if (imgRes && imgRes[0]?.url) {
                return imgRes[0].url;
            } else {
                sonnerToast("Uh oh! Something went wrong.", {
                    description: "File upload failed. Please try again.",
                });
                return null;
            }
        } catch (err) {
            sonnerToast("Upload error", {
                description: "Failed to process the image, Please try again.",
            });
            return null;
        } finally {
            setIsImageLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (files.length > 0) {
                const uploaded = await uploadImage(files[0]);
                if (uploaded) {
                    setImage(uploaded);
                    setFilePreview(undefined);
                }
            }
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
                coverImage: image,
            };

            const url = isEdit ? `/api/blogs/${initialData._id}` : '/api/blogs';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success || res.ok) { // Check both depending on API response format
                sonnerToast.success(`Blog post ${isEdit ? 'updated' : 'created'} successfully`);
                router.push('/admin/blogs');
                router.refresh();
            } else {
                sonnerToast.error(data.message || 'Something went wrong');
            }
        } catch (error) {
            console.error(error);
            sonnerToast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8 text-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Slug (Optional)</label>
                    <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="Leave empty to auto-generate"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Excerpt</label>
                <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Content (Markdown)</label>
                <div className="relative">
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={15}
                        required
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="absolute right-2 top-2 text-xs text-gray-500 pointer-events-none">
                        Markdown Supported
                    </div>
                </div>
            </div>

            {/* <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image URL</label>
                <div className="flex gap-4 items-center">
                    <input
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    /> */}
            {/* Placeholder for Upload Button if needed later
                    <div className="shrink-0">
                         <UploadButton ... />
                    </div>
                    */}
            {/* </div>
            </div> */}
            <div className="flex flex-col justify-center gap-2">
                <label htmlFor="image" className="text-gray-300 font-medium text-sm">Profile Picture</label>
                <div className="flex flex-col items-center gap-3">
                    <Dropzone
                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                        onDrop={handleImage}
                        onError={(err) => {
                            setError(true);
                            setTimeout(() => setError(false), 4000);
                        }}
                        src={files}
                        maxFiles={1}
                        className="hover:bg-primary bg-gray-900 border-gray-700"
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent>
                            {image && (
                                <Image
                                    src={filePreview ? filePreview : image}
                                    alt={formData?.title}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-contain rounded-full"
                                />
                            )}
                        </DropzoneContent>
                    </Dropzone>
                    {isImageLoading && <div className="w-fit"><Loader /></div>}
                    {error &&
                        <span className="font-normal text-red-500">Something went error, Please try again</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="React, NextJS, Tutorial"
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                    <button
                        type="button"
                        onClick={handleToggle}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out relative ${formData.isPublished ? 'bg-green-600' : 'bg-gray-700'}`}
                    >
                        <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${formData.isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className="font-medium">{formData.isPublished ? "Published" : "Draft"}</span>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 flex items-center"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Update Post' : 'Create Post'}
                </button>
            </div>
        </form>
    );
};

export default BlogForm;

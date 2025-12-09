import BlogForm from "@/components/Admin/BlogForm";
import { cookies } from "next/headers";

const getBlog = async (id: string) => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const res = await fetch(`${domain}/api/blogs/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token?.value || ''}`
            },
            cache: 'no-store'
        });

        if (!res.ok) return null;

        const json = await res.json();
        return json.success ? json.data : null;
    } catch (error) {
        console.error("Failed to fetch blog:", error);
        return null;
    }
}

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const blog = await getBlog(id);

    if (!blog) {
        return <div className="p-8 text-white">Blog post not found</div>
    }

    return (
        <div className="grid grid-rows-[auto_1fr] h-full w-full p-8 gap-10">
            <h1 className="text-white font-bold text-3xl">Edit Blog Post</h1>
            <BlogForm initialData={blog} isEdit={true} />
        </div>
    )
};
export default Page;

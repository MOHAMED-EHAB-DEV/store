import BlogForm from "@/components/Admin/BlogForm";

const getBlog = async (id: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/blogs/${id}`);

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

import BlogForm from "@/components/Admin/BlogForm";

const Page = () => {
    return (
        <div className="grid grid-rows-[auto_1fr] h-full w-full p-8 gap-10">
            <h1 className="text-white font-bold text-3xl">Create New Blog Post</h1>
            <BlogForm />
        </div>
    )
};
export default Page;

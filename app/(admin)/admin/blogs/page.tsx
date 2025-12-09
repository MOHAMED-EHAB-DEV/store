import Link from "next/link";
import Blogs from "@/components/Admin/Blogs";
import { cookies } from "next/headers";

const getData = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token");
        const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Adding 'admin=true' to show all posts including drafts
        const res = await fetch(`${domain}/api/blogs?admin=true&limit=100`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token?.value || ''}`
            },
            cache: 'no-store' // Dynamic data
        });

        if (!res.ok) {
            return [];
        }

        const json = await res.json();
        return json.success ? json.data : [];
    } catch (err) {
        console.error("Failed to fetch blogs:", err);
        return [];
    }
}

const Page = async () => {
    const blogs = await getData();

    return (
        <div className="grid grid-rows-[auto_1fr] h-full w-full p-8 gap-10">
            <h1 className="text-white font-bold text-3xl">Blog Management</h1>
            <Blogs initialData={blogs} />
        </div>
    )
};
export default Page;

import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminBlogsClient from "@/components/Admin/AdminBlogsClient";
import { authenticateUser } from "@/middleware/auth";
import { ErrorState } from "@/components/Dashboard/shared/LoadingStates";

export const metadata: Metadata = {
    title: "Blogs Management | Admin Dashboard",
    description: "Manage blog posts and content",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getBlogs() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/admin/blogs?limit=1000`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        const data = response.ok ? await response.json() : { data: [] };
        return data.data || [];
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return null;
    }
}

export default async function AdminBlogsPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const blogs = await getBlogs();

    if (blogs === null) {
        return <ErrorState message="Failed to load blogs. Please refresh the page." />;
    }

    return <AdminBlogsClient blogs={blogs} />;
}

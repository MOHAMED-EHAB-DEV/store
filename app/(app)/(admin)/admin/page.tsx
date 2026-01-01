import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardHome from "@/components/Admin/AdminDashboardHome";
import { authenticateUser } from "@/middleware/auth";

export const metadata: Metadata = {
    title: "Admin Dashboard | Analytics",
    description: "Comprehensive admin dashboard with analytics and insights",
    robots: "noindex, nofollow", // Admin pages should not be indexed
};

export const dynamic = "force-dynamic";

async function getAdminDashboardData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const [usersRes, templatesRes, downloadsRes, ticketsRes] = await Promise.all([
            fetch(`${baseUrl}/api/admin/users?limit=1000`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/api/admin/templates?limit=1000`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/api/admin/download-logs?limit=1000`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/api/admin/tickets?limit=1000`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            })
        ]);

        const users = usersRes.ok ? await usersRes.json() : { data: [] };
        const templates = templatesRes.ok ? await templatesRes.json() : { data: [] };
        const downloads = downloadsRes.ok ? await downloadsRes.json() : { data: [] };
        const tickets = ticketsRes.ok ? await ticketsRes.json() : { data: [] };

        return {
            users: users.data || [],
            templates: templates.data || [],
            downloads: downloads.data || [],
            tickets: tickets.data || [],
        };
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        return { users: [], templates: [], downloads: [], tickets: [] };
    }
}

export default async function AdminDashboardPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const data = await getAdminDashboardData();

    return <AdminDashboardHome data={data} />;
}
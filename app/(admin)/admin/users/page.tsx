import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminUsersClient from "@/components/Admin/AdminUsersClient";
import { authenticateUser } from "@/middleware/auth";
import { ErrorState } from "@/components/Dashboard/shared/LoadingStates";

export const metadata: Metadata = {
    title: "User Management | Admin Dashboard",
    description: "Manage all users, roles, and permissions",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getUsers() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const response = await fetch(`${baseUrl}/api/admin/users?limit=1000`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        const data = response.ok ? await response.json() : { data: [] };
        return data.data || [];
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
}

export default async function AdminUsersPage() {
    const user = await authenticateUser(true, true, true);
    if (!user) redirect("/");

    const users = await getUsers();

    if (users === null) {
        return <ErrorState message="Failed to load users. Please refresh the page." />;
    }

    return <AdminUsersClient users={users} />;
}

import { Metadata } from "next";
import { cookies } from "next/headers";
import AdminUsersClient from "@/components/Admin/AdminUsersClient";
import ErrorState from "@/components/Dashboard/shared/ErrorState";

export const metadata: Metadata = {
    title: "User Management | Admin Dashboard",
    description: "Manage all users, roles, and permissions",
    robots: "noindex, nofollow",
};

export const dynamic = "force-dynamic";

async function getUsers(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.role) params.set("role", searchParams.role);
    if (searchParams.tier) params.set("tier", searchParams.tier);
    if (searchParams.verified) params.set("verified", searchParams.verified);
    params.set("limit", "20");

    try {
        const response = await fetch(`${baseUrl}/api/admin/users?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = await getUsers(params);

    if (!data) {
        return (
            <div className="p-6 text-center">
                <ErrorState
                    message="Failed to load users. Please try again."
                />
            </div>
        );
    }

    return (
        <AdminUsersClient
            initialData={data.data}
            stats={data.stats}
            pagination={data.pagination}
            searchParams={params}
        />
    );
}

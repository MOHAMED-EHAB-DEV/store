import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import UserDetailClient from "@/components/Admin/UserDetailClient";

export const metadata: Metadata = {
    title: "User Details | Admin",
    description: "View and manage user details"
};

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getUser(id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/users/${id}`, { headers: await headers() });

        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
        return null;
    }
}

export default async function AdminUserDetailPage({ params }: PageProps) {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
        notFound();
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/users"
                    className="text-muted-foreground hover:text-white transition-colors"
                >
                    ← Back to Users
                </Link>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-white">User Details</h1>
                <p className="text-muted-foreground">View and manage user information</p>
            </div>

            <UserDetailClient user={user} />
        </div>
    );
}

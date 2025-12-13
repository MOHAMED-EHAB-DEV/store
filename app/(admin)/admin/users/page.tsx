import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Users Management | Admin",
    description: "Manage all users"
};

async function getUsers(searchParams: { [key: string]: string | undefined }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const params = new URLSearchParams();
    if (searchParams.page) params.set("page", searchParams.page);
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.role) params.set("role", searchParams.role);
    if (searchParams.tier) params.set("tier", searchParams.tier);
    params.set("limit", "20");

    try {
        const response = await fetch(`${baseUrl}/api/admin/users?${params.toString()}`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return { users: [], pagination: null };
        const data = await response.json();
        return { users: data.data || [], pagination: data.pagination };
    } catch (error) {
        return { users: [], pagination: null };
    }
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { users, pagination } = await getUsers(params);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Users Management</h1>
                    <p className="text-muted-foreground">
                        {pagination?.total || 0} total users
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass rounded-xl p-4">
                <form className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search by name or email..."
                        defaultValue={params.search || ""}
                        className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Select
                        defaultValue={params.role || ""}
                        // className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors"
                    >
                        <SelectTrigger className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors">
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="bg-gray-900 focus:bg-primary hover:bg-primary">All Roles</SelectItem>
                            <SelectItem value="user" className="bg-gray-900 focus:bg-primary hover:bg-primary">User</SelectItem>
                            <SelectItem value="admin" className="bg-gray-900 focus:bg-primary hover:bg-primary">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                    <select
                        name="tier"
                        defaultValue={params.tier || ""}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white/15 transition-colors"
                    >
                        <option value="" className="bg-gray-900">All Tiers</option>
                        <option value="free" className="bg-gray-900">Free</option>
                        <option value="premium" className="bg-gray-900">Premium</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                    >
                        Filter
                    </button>
                </form>
            </div>

            {/* Users Table */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tier</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <span className="text-white font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-gray-500/20 text-gray-400"}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.tier === "premium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-500/20 text-slate-300 border border-slate-500/30"}`}>
                                                {user.tier === "premium" ? "Premium" : "Free"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-muted-foreground text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={`/admin/users/${user._id}`}
                                                className="text-blue-400 hover:text-blue-300 hover:underline text-sm font-medium transition-colors"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Page {pagination.page} of {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            {pagination.page > 1 && (
                                <Link
                                    href={`/admin/users?page=${pagination.page - 1}&search=${params.search || ""}&role=${params.role || ""}&tier=${params.tier || ""}`}
                                    className="px-3 py-1 bg-white/5 rounded text-sm text-white hover:bg-white/10"
                                >
                                    Previous
                                </Link>
                            )}
                            {pagination.page < pagination.pages && (
                                <Link
                                    href={`/admin/users?page=${pagination.page + 1}&search=${params.search || ""}&role=${params.role || ""}&tier=${params.tier || ""}`}
                                    className="px-3 py-1 bg-white/5 rounded text-sm text-white hover:bg-white/10"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

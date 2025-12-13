import { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Admin Dashboard | Overview",
    description: "Admin dashboard overview with stats and analytics"
};

async function getDashboardStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const [usersRes, downloadsRes] = await Promise.all([
            fetch(`${baseUrl}/api/admin/users/stats`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            }),
            fetch(`${baseUrl}/api/admin/download-logs/stats`, {
                headers: { Cookie: `token=${token}` },
                cache: "no-store"
            })
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : null;
        const downloadsData = downloadsRes.ok ? await downloadsRes.json() : null;

        return {
            users: usersData?.data || null,
            downloads: downloadsData?.data || null
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return { users: null, downloads: null };
    }
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    const statCards = [
        {
            label: "Total Users",
            value: stats.users?.totals?.total || 0,
            subtext: `${stats.users?.totals?.premium || 0} Premium`,
            color: "from-purple-500 to-pink-500",
            href: "/admin/users"
        },
        {
            label: "Total Downloads",
            value: stats.downloads?.totals?.total || 0,
            subtext: `${stats.downloads?.totals?.success || 0} Successful Downloads`,
            color: "from-emerald-500 to-teal-500",
            href: "/admin/download-logs"
        },
        {
            label: "Active Admins",
            value: stats.users?.totals?.admins || 0,
            subtext: "Administrators",
            color: "from-blue-500 to-cyan-500",
            href: "/admin/users?role=admin"
        },
        {
            label: "Verified Users",
            value: stats.users?.totals?.verified || 0,
            subtext: "Email Verified",
            color: "from-orange-500 to-red-500",
            href: "/admin/users"
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="glass rounded-xl p-4 hover:bg-white/5 transition-colors"
                    >
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                    </Link>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Recent Users</h2>
                        <Link href="/admin/users" className="text-xs text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {stats.users?.recentUsers?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No users yet
                            </div>
                        ) : (
                            stats.users?.recentUsers?.map((user: any) => (
                                <Link
                                    key={user._id}
                                    href={`/admin/users/${user._id}`}
                                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.tier === "premium" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-slate-500/20 text-slate-300 border border-slate-500/30"}`}>
                                        {user.tier === "premium" ? "Premium" : "Free"}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Downloads */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Recent Downloads</h2>
                        <Link href="/admin/download-logs" className="text-xs text-primary hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {stats.downloads?.recentDownloads?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No downloads yet
                            </div>
                        ) : (
                            stats.downloads?.recentDownloads?.map((log: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-4">
                                    <div className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {log.templateTitle || log.filename}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.userName || "Anonymous"} • {new Date(log.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Top Templates */}
            {stats.downloads?.topTemplates && stats.downloads.topTemplates.length > 0 && (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-semibold text-white">Top Downloaded Templates</h2>
                    </div>
                    <div className="p-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {stats.downloads.topTemplates.slice(0, 5).map((template: any, idx: number) => (
                                <div key={template._id} className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-muted-foreground">
                                        #{idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {template.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {template.count} downloads
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/admin/blogs/new"
                    className="glass rounded-xl p-4 hover:bg-white/5 transition-colors text-center"
                >
                    <p className="text-white font-medium">New Blog Post</p>
                    <p className="text-xs text-muted-foreground mt-1">Create a new article</p>
                </Link>
                <Link
                    href="/admin/faqs/new"
                    className="glass rounded-xl p-4 hover:bg-white/5 transition-colors text-center"
                >
                    <p className="text-white font-medium">New FAQ</p>
                    <p className="text-xs text-muted-foreground mt-1">Add FAQ entry</p>
                </Link>
                <Link
                    href="/admin/categories/new"
                    className="glass rounded-xl p-4 hover:bg-white/5 transition-colors text-center"
                >
                    <p className="text-white font-medium">New Category</p>
                    <p className="text-xs text-muted-foreground mt-1">Create template category</p>
                </Link>
                <Link
                    href="/admin/support"
                    className="glass rounded-xl p-4 hover:bg-white/5 transition-colors text-center"
                >
                    <p className="text-white font-medium">Support Tickets</p>
                    <p className="text-xs text-muted-foreground mt-1">View open tickets</p>
                </Link>
            </div>
        </div>
    );
}
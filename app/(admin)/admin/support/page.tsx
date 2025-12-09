import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Support Dashboard | Admin",
    description: "Manage customer support tickets"
};

async function getStats() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/support/stats`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.data;
    } catch (error) {
        return null;
    }
}

async function getTickets() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/support?status=open&limit=10`, {
            headers: { Cookie: `token=${token}` },
            cache: "no-store"
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        return [];
    }
}

export default async function AdminSupportPage() {
    const [stats, tickets] = await Promise.all([getStats(), getTickets()]);

    const statCards = [
        { label: "Total Tickets", value: stats?.totals?.total || 0, color: "from-purple-500 to-pink-500" },
        { label: "Open", value: stats?.totals?.open || 0, color: "from-emerald-500 to-teal-500" },
        { label: "Resolved", value: stats?.totals?.resolved || 0, color: "from-blue-500 to-cyan-500" },
        { label: "Urgent", value: stats?.totals?.urgent || 0, color: "from-red-500 to-orange-500" }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Support Dashboard</h1>
                    <p className="text-muted-foreground">Manage customer support tickets</p>
                </div>

                <Link
                    href="/admin/support/tickets"
                    className="btn btn-secondary text-sm"
                >
                    View All Tickets
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="glass rounded-xl p-4">
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Open Tickets */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-semibold text-white">Open Tickets</h2>
                    <span className="text-xs text-muted-foreground">{tickets.length} tickets</span>
                </div>

                <div className="divide-y divide-white/5">
                    {tickets.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            No open tickets
                        </div>
                    ) : (
                        tickets.map((ticket: any) => (
                            <Link
                                key={ticket._id}
                                href={`/admin/support/${ticket._id}`}
                                className="block p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-white truncate">{ticket.subject}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {ticket.user?.name} • {ticket.user?.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.priority === "urgent" ? "bg-red-500/20 text-red-400" :
                                                ticket.priority === "high" ? "bg-orange-500/20 text-orange-400" :
                                                    "bg-yellow-500/20 text-yellow-400"
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(ticket.lastMessageAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Tickets */}
            {stats?.recentTickets && stats.recentTickets.length > 0 && (
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-semibold text-white">Recent Tickets</h2>
                    </div>

                    <div className="divide-y divide-white/5">
                        {stats.recentTickets.map((ticket: any) => (
                            <Link
                                key={ticket._id}
                                href={`/admin/support/${ticket._id}`}
                                className="block p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{ticket.subject}</p>
                                        <p className="text-sm text-muted-foreground">{ticket.user?.name}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.status === "open" ? "bg-emerald-500/20 text-emerald-400" :
                                            ticket.status === "resolved" ? "bg-blue-500/20 text-blue-400" :
                                                "bg-gray-500/20 text-gray-400"
                                        }`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

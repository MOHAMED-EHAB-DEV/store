"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import TicketCard from "@/components/Support/TicketCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import StatCard from "@/components/Dashboard/shared/StatCard";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Headset, Plus } from "@/components/ui/svgs/Icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/support/tickets?limit=50`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            const allTickets = data.data || [];
            setTickets(allTickets);

            // Calculate stats
            setStats({
                total: allTickets.length,
                open: allTickets.filter((t: any) => t.status === "open").length,
                inProgress: allTickets.filter((t: any) => t.status === "in-progress").length,
                resolved: allTickets.filter((t: any) => t.status === "resolved").length,
            });
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch tickets");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        if (activeTab === "all") return true;
        return ticket.status === activeTab;
    });

    const statCards = [
        {
            label: "Total Tickets",
            value: stats.total,
            subtext: "All time",
            gradient: "from-purple-500 to-pink-500",
        },
        {
            label: "Open",
            value: stats.open,
            subtext: "Awaiting response",
            gradient: "from-green-500 to-emerald-500",
        },
        {
            label: "In Progress",
            value: stats.inProgress,
            subtext: "Being handled",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Resolved",
            value: stats.resolved,
            subtext: "Completed",
            gradient: "from-gray-500 to-slate-500",
        },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Support Tickets"
                description="Track and manage your support requests"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Support" },
                ]}
                actions={
                    <Link href="/support">
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="w-4 h-4 mr-2" />
                            New Ticket
                        </Button>
                    </Link>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} icon={Headset} />
                ))}
            </div>

            {/* Tickets with Tabs */}
            <div className="glass rounded-xl overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-white/10 px-4">
                        <TabsList className="bg-transparent h-auto p-0 gap-4">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-4 px-0"
                            >
                                All ({stats.total})
                            </TabsTrigger>
                            <TabsTrigger
                                value="open"
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-4 px-0"
                            >
                                Open ({stats.open})
                            </TabsTrigger>
                            <TabsTrigger
                                value="in-progress"
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-4 px-0"
                            >
                                In Progress ({stats.inProgress})
                            </TabsTrigger>
                            <TabsTrigger
                                value="resolved"
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-4 px-0"
                            >
                                Resolved ({stats.resolved})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value={activeTab} className="mt-0">
                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="p-8">
                                <EmptyState
                                    icon={Headset}
                                    title={
                                        activeTab === "all"
                                            ? "No tickets yet"
                                            : `No ${activeTab.replace("-", " ")} tickets`
                                    }
                                    description={
                                        activeTab === "all"
                                            ? "Create a support ticket to get help from our team"
                                            : "Try switching to a different tab"
                                    }
                                    action={
                                        activeTab === "all"
                                            ? {
                                                label: "Create Your First Ticket",
                                                onClick: () => (window.location.href = "/support"),
                                            }
                                            : undefined
                                    }
                                />
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                {filteredTickets.map((ticket) => (
                                    <TicketCard
                                        key={ticket._id}
                                        ticket={ticket}
                                        href={`/dashboard/support/${ticket._id}`}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

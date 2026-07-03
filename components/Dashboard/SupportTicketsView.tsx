"use client";

import { useState } from "react";
import Link from "next/link";
import TicketCard from "@/components/Support/TicketCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import StatCard from "@/components/Dashboard/shared/StatCard";
import EmptyState from "@/components/Dashboard/shared/EmptyState";
import { Headset } from "@/components/ui/svgs/icons/Headset";
import { Plus } from "@/components/ui/svgs/icons/Plus";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SupportTicketsView({ initialTickets }: { initialTickets: any[] }) {
    const [tickets] = useState<any[]>(initialTickets);
    const [activeTab, setActiveTab] = useState("all");

    // Calculate stats
    const stats = {
        total: tickets.length,
        open: tickets.filter((t: any) => t.status === "open").length,
        inProgress: tickets.filter((t: any) => t.status === "in-progress").length,
        resolved: tickets.filter((t: any) => t.status === "resolved").length,
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
                        {filteredTickets.length === 0 ? (
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

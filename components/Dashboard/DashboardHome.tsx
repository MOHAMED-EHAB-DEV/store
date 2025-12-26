"use client";

import React from "react";
import { IUser } from "@/types";
import StatCard from "@/components/Dashboard/shared/StatCard";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import { Templates, Headset, Star, Download, Settings } from "@/components/ui/svgs/Icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface DashboardHomeProps {
    user: IUser;
    data: {
        templates: any[];
        tickets: any[];
    };
}

export default function DashboardHome({ user, data }: DashboardHomeProps) {
    const { templates, tickets } = data;

    const activeTickets = tickets.filter((t: any) => t.status !== "resolved").length;
    const isPremium = user.tier === "premium";

    const stats = [
        {
            label: "Purchased Templates",
            value: templates.length,
            subtext: `${templates.length} total downloads`,
            icon: Templates,
            gradient: "from-purple-500 to-pink-500",
            href: "/dashboard/purchased-templates",
        },
        {
            label: "Active Tickets",
            value: activeTickets,
            subtext: `${tickets.length} total tickets`,
            icon: Headset,
            gradient: "from-blue-500 to-cyan-500",
            href: "/dashboard/support",
        },
        {
            label: "Account Tier",
            value: isPremium ? "Premium" : "Free",
            subtext: isPremium ? "All features unlocked" : "Upgrade for more",
            icon: Star,
            gradient: isPremium ? "from-amber-500 to-orange-500" : "from-gray-500 to-slate-500",
        },
    ];

    const recentTemplates = templates.slice(0, 3);

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title={`Welcome back, ${user.name.split(" ")[0]}!`}
                description="Here's what's happening with your account"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="glass rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link href="/templates">
                        <Button className="w-full cursor-pointer bg-primary hover:bg-primary/90">
                            <Download className="w-4 h-4 mr-2" />
                            Browse Templates
                        </Button>
                    </Link>
                    <Link href="/support">
                        <Button variant="outline" className="w-full cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Headset className="w-4 h-4 mr-2" />
                            Create Ticket
                        </Button>
                    </Link>
                    <Link href="/dashboard/purchased-templates">
                        <Button variant="outline" className="w-full cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Templates className="w-4 h-4 mr-2" />
                            My Templates
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button variant="outline" className="w-full cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Templates */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Recent Templates</h2>
                        <Link href="/dashboard/purchased-templates" className="text-xs text-primary hover:underline">
                            <Button variant="outline" className="w-full cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10">
                                View all
                            </Button>
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {recentTemplates.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No templates yet.
                            </div>
                        ) : (
                            recentTemplates.map((template: any) => (
                                <div key={template._id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{template.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Downloaded {new Date(template.downloadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Link href={`/templates/${template.slug}`}>
                                        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                                            View
                                        </Button>
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="glass rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold text-white">Recent Tickets</h2>
                        <Link href="/dashboard/support" className="text-xs text-primary hover:underline">
                            <Button variant="outline" className="w-full cursor-pointer bg-white/5 border-white/10 text-white hover:bg-white/10">
                                View all
                            </Button>
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {tickets.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No support tickets.
                            </div>
                        ) : (
                            tickets.slice(0, 3).map((ticket: any) => (
                                <Link
                                    key={ticket._id}
                                    href={`/dashboard/support/${ticket._id}`}
                                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(ticket.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge
                                        className={`${ticket.status === "open"
                                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                                            : ticket.status === "in-progress"
                                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                                : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                                            }`}
                                    >
                                        {ticket.status}
                                    </Badge>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Upgrade CTA for Free Users */}
            {!isPremium && (
                <div className="glass rounded-xl p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-2">Upgrade to Premium</h3>
                            <p className="text-muted-foreground">
                                Get unlimited downloads, priority support, and exclusive templates
                            </p>
                        </div>
                        <Link href="/pricing">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                <Star className="w-4 h-4 mr-2" />
                                Upgrade Now
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

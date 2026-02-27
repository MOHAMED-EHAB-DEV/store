"use client";

import { useState } from "react";
import PageHeader from "@/components/Dashboard/shared/PageHeader";
import UpdateProfile from "@/components/Dashboard/Settings/UpdateProfile";
import ChangePassword from "@/components/Dashboard/Settings/ChangePassword";
import Preferences from "@/components/Dashboard/Settings/Preferences";
import { User, Lock, Settings as SettingsIcon, Star } from "@/components/ui/svgs/Icons";
import { Badge } from "@/components/ui/badge";
import { IUser } from "@/types";

interface SettingsClientProps {
    user: IUser;
}

export default function SettingsClient({ user }: SettingsClientProps) {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
        { id: "preferences", label: "Preferences", icon: SettingsIcon },
        { id: "subscription", label: "Subscription", icon: Star },
    ];

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your account settings and preferences"
                breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Settings" },
                ]}
            />

            {/* Account Status Card */}
            <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-1">Account Status</h2>
                        <p className="text-muted-foreground">
                            {user.isEmailVerified ? "Your account is verified" : "Please verify your email"}
                        </p>
                    </div>
                    <Badge
                        className={
                            user.tier === "pro"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30 text-lg px-4 py-2"
                                : "bg-slate-500/20 text-slate-300 border-slate-500/30 text-lg px-4 py-2"
                        }
                    >
                        {user.tier === "pro" ? "Pro" : "Free"}
                    </Badge>
                </div>
            </div>

            {/* Tabs */}
            <div className="glass rounded-xl overflow-hidden">
                <div className="border-b border-white/10 px-4 flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                                    ? "text-white border-b-2 border-primary"
                                    : "text-muted-foreground hover:text-white"
                                    }`}
                                aria-label={`Switch to ${tab.label} tab`}
                            >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="p-6">
                    {activeTab === "profile" && <UpdateProfile user={user} />}
                    {activeTab === "security" && <ChangePassword />}
                    {activeTab === "preferences" && <Preferences />}
                    {activeTab === "subscription" && (
                        <div className="space-y-6">
                            <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {user.tier === "pro" ? "Pro Plan" : "Free Plan"}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {user.tier === "pro"
                                                ? "You have access to all Pro features"
                                                : "Upgrade to unlock Pro templates and features"}
                                        </p>
                                    </div>
                                    <Star className="w-8 h-8 text-amber-400" aria-hidden="true" />
                                </div>

                                {user.tier === "starter" && (
                                    <button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all">
                                        Upgrade to pro
                                    </button>
                                )}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-white">
                                    {user.tier === "pro" ? "Pro Features" : "Upgrade Benefits"}
                                </h4>
                                <ul className="space-y-2">
                                    {[
                                        "Unlimited template downloads",
                                        "Priority customer support",
                                        "Early access to new templates",
                                        "Commercial use license",
                                        "Exclusive pro templates",
                                    ].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-muted-foreground">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

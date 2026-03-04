"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp } from "@/components/ui/svgs/icons/TrendingUp";
import { TrendingDown } from "@/components/ui/svgs/icons/TrendingDown";

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: React.ComponentType<{ className?: string }>;
    gradient: string;
    href?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
}

export default function StatCard({
    label,
    value,
    subtext,
    icon: Icon,
    gradient,
    href,
    trend,
    loading = false,
}: StatCardProps) {
    const content = (
        <div className={`glass rounded-xl p-6 ${href ? "hover:bg-white/5 cursor-pointer" : ""} transition-all duration-300`}>
            {loading ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-8 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/3" />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        {Icon && (
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} bg-opacity-10`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex items-baseline gap-2">
                        <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                        {trend && (
                            <div className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
                                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span>{Math.abs(trend.value)}%</span>
                            </div>
                        )}
                    </div>

                    {subtext && (
                        <p className="text-xs text-muted-foreground mt-2">{subtext}</p>
                    )}
                </>
            )}
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}

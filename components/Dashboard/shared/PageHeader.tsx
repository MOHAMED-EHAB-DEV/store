"use client";

import React from "react";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRight";
import Link from "next/link";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 pb-6 border-b border-white/10">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="text-muted-foreground hover:text-white transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-white font-medium">{crumb.label}</span>
                            )}
                            {index < breadcrumbs.length - 1 && (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

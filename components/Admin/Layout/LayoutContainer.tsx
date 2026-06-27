"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Admin/Layout/Sidebar";
import { IUser } from '@/types';
import { Menu } from "@/components/ui/svgs/icons/Menu";

const LayoutContainer = ({ children, user }: { children: React.ReactNode, user: IUser }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="lg:w-[calc(100%-18rem)] w-full ms-auto">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 start-0 w-full h-14 bg-dark/90 backdrop-blur-md flex items-center justify-between px-4 z-40 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpen(true)}
                        className="p-2 text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                        aria-label="Open sidebar"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-white font-bold text-lg">Admin</span>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
                />
            )}

            <Sidebar user={user} open={open} setOpen={setOpen} />
            <div className="lg:pt-0 pt-14">
                {children}
            </div>
        </div>
    )
}
export default LayoutContainer;

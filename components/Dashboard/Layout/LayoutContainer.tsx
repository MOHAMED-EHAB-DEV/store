"use client";

import React, { useState } from 'react';
import Sidebar from "@/components/Dashboard/Layout/Sidebar";
import { IUser } from '@/types';

const LayoutContainer = ({ children, user, socketToken }: { children: React.ReactNode, user: IUser, socketToken?: string }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="lg:w-[calc(100%-18rem)] w-full ms-auto">
            <Sidebar user={user} open={open} setOpen={setOpen} socketToken={socketToken} />
            <div className="lg:pt-0 pt-14">
                {children}
            </div>
        </div>
    )
}
export default LayoutContainer

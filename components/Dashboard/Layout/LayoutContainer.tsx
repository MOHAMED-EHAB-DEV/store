"use client";

import React, {useState} from 'react';
import {ArrowLeftToLine} from "@/components/ui/svgs/Icons";
import Sidebar from "@/components/Dashboard/Layout/Sidebar";
import {usePathname} from "next/navigation";
import {capitalizeFirstChar} from "@/lib/utils";

const LayoutContainer = ({children, user}: Readonly<{children: React.ReactNode, user: IUser}>) => {
    const [open, setOpen] = useState(false);
    const title = capitalizeFirstChar(usePathname().split("/")[1]);

    return (
        <div className="lg:w-[calc(100%-18rem)] w-full ms-auto">
            <button className="lg:hidden p-1 bg-black border-b border-r border-t border-white rounded-tr-sm rounded-br-sm cursor-pointer absolute left-0 top-1/12" onClick={() => setOpen((prev) => !prev)}>
                <ArrowLeftToLine className="w-[17px] h-[17px]" />
            </button>
            <Sidebar open={open} setOpen={setOpen} title={title} user={user} />
            {children}
        </div>
    )
}
export default LayoutContainer

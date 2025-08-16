"use client";

import React, {useState} from 'react';
import {ArrowLeftToLine} from "@/components/ui/svgs/Icons";
import Sidebar from "@/components/Admin/Layout/Sidebar";
import {usePathname} from "next/navigation";
import {capitalizeFirstChar} from "@/lib/utils";

const LayoutContainer = ({children, user}: Readonly<{children: React.ReactNode, user: IUser}>) => {
    const [open, setOpen] = useState(false);
    const title = capitalizeFirstChar(usePathname().split("/").at(-1)?.split("-")[1] as string);

    return (
        <div className="lg:w-[calc(100%-18rem)] w-full ms-auto">
            <button className="lg:hidden p-1 bg-black border-b border-r border-t border-white rounded-tr-sm rounded-br-sm cursor-pointer absolute left-0 top-1/12" onClick={() => setOpen((prev) => !prev)}>
                <ArrowLeftToLine className="w-[17px] h-[17px]" />
            </button>
            <Sidebar user={user} open={open} setOpen={setOpen} title={title} />
            {children}
        </div>
    )
}
export default LayoutContainer

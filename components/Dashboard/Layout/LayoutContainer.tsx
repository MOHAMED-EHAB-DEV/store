import React from 'react';
import Sidebar from "@/components/Dashboard/Layout/Sidebar";
import { IUser } from '@/types';

const LayoutContainer = ({ children, user }: { children: React.ReactNode, user: IUser }) => (
    <div className="lg:w-[calc(100%-18rem)] w-full ms-auto">
        <Sidebar user={user} />
        <div className="lg:pt-0 pt-14">
            {children}
        </div>
    </div>
)
export default LayoutContainer;

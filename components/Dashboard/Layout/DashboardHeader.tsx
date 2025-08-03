import React from 'react';
import {Menu} from "lucide-react";
import Image from "next/image";
import ProfileDropdown from "@/components/Dialogs/ProfileDropdown";

const DashboardHeader = ({setOpen, user}: { setOpen: React.Dispatch<React.SetStateAction<boolean>>, user: IUser }) => {
    return (
        <div className="flex justify-between items-center w-full shadow-lg shadow-dark py-3 px-4">
            <div className="flex gap-3 items-center justify-center">

            </div>

            <ProfileDropdown userImage={user?.avatar as string} username={user?.name} userEmail={user?.email}/>
        </div>
    )
}
export default DashboardHeader;
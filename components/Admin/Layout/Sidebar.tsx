import React, { MouseEvent as ReactMouseEvent, useState } from 'react';
import { X, ChevronUp, ChevronDown, LogOut } from "@/components/ui/svgs/Icons";
import Logo from "@/components/ui/Logo";
import { AdminSidebarLinks } from "@/constants";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home } from "@/components/ui/svgs/Icons";
import { sonnerToast } from "@/components/ui/sonner";
import { IUser } from '@/types';
import NotificationCenter from "@/components/NotificationCenter";

const Sidebar = ({ open, setOpen, user, socketToken }: {
    open: Boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    user: IUser,
    socketToken?: string
}) => {

    const router = useRouter();
    const path = usePathname();

    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async (e: ReactMouseEvent<HTMLDivElement>) => {
        try {
            e?.preventDefault();

            const response = await fetch("/api/user/logout");

            const data = await response.json();
            if (!data.success)
                throw new Error(data.message);
            sonnerToast.success("Successfully LoggedOut");
            setTimeout(() => {
                window.location.href = `/`;
            }, 100);
        } catch (err) {
            // console.log(err);
            sonnerToast.error((err as Error).message);
        }
    }

    return (
        <div
            className={`lg:start-0 z-50 w-[18rem] bg-dark flex flex-col md:p-8 p-4 justify-between h-screen fixed top-0 overflow-auto transition-[inset-inline-start] duration-300 ${open ? "start-0" : "-start-72"
                } `}
        >
            <div className="">
                <button onClick={() => setOpen(false)} aria-label="Close sidebar"
                    className="bg-transparent cursor-pointer flex items-center justify-center lg:hidden rounded-full absolute top-2 end-2 p-4">
                    <X />
                </button>

                <div className="flex items-center gap-4">
                    <Logo onClick={() => router.push("/")} />
                    <h1 className="text-white font-bold text-2xl">Admin</h1>
                </div>

                <div className="flex flex-col gap-1 md:mt-14 mt-10">
                    {AdminSidebarLinks.map(({ Icon, text, link }, idx) => (
                        <div key={idx} onClick={() => {
                            setIsOpen(false);
                            router.push(link);
                        }}
                            className={`w-full h-10 cursor-pointer transition-all px-5 py-3 rounded-md flex gap-3 items-center ${path === link ? "bg-white/10" : "hover:bg-white/10"}`}>
                            <Icon className="w-5 h-5 text-white" />
                            <span className={`text-white text-sm ${path === link && "font-bold"}`}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative flex items-center w-full h-20">
                {/* Line */}
                <div className="h-1 absolute top-0 left-0 w-full rounded-full bg-white/10" />
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger
                        className="px-3 py-2 hover:bg-white/10 outline-none border-none flex items-center justify-center gap-3 rounded-lg transition-all duration-400 cursor-pointer">
                        <div className="w-7 h-7 flex items-center justify-center">
                            <Image
                                src={user?.avatar === "" ? "/assets/Icons/profile.svg" : user?.avatar as string}
                                alt={`${user?.name} Profile`}
                                width={30}
                                height={30}
                                className="p-px rounded-full transition-all duration-500 w-full h-full border hover:border-white"
                            />
                        </div>
                        <div className="flex gap-1 items-center">
                            <h1 className="text-md font-semibold text-white">{user?.name.split(" ")[0]}</h1>
                        </div>
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-dark">
                        <DropdownMenuItem onClick={() => router.push("/")} className="flex flex-row gap-4 px-4 py-3 items-center hover:bg-secondary/30 cursor-pointer transition-all w-full">
                            <Home />
                            <span className="text-white font-medium text-md">Home</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="flex flex-row gap-4 px-4 py-3 items-center hover:bg-secondary/30 cursor-pointer transition-all w-full">
                            <LogOut />
                            <span className="text-white font-medium text-md">Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <NotificationCenter socketToken={socketToken} />
            </div>
        </div>
    )
}
export default Sidebar;
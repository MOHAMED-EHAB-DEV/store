import {MouseEvent as ReactMouseEvent, useState} from "react";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Settings,
    LogOut,
} from "@/components/ui/svgs/Icons";
import {useRouter} from "next/navigation";
import revalidate from "@/actions/revalidateTag";

const ProfileDropdown = ({userImage, username, userEmail}: {
    userImage: String,
    username: String,
    userEmail: String
}) => {
    const [open, isOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async (e: ReactMouseEvent<HTMLDivElement>) => {
        try {
            e?.preventDefault();

            const response = await fetch("/api/user/logout");

            const data = await response.json();
            if (data?.success) await revalidate("/");
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <DropdownMenu open={open} onOpenChange={isOpen}>
            <DropdownMenuTrigger className="items-center relative w-10 h-10 outline-none justify-center flex cursor-pointer">
                <Image
                    src={userImage === "" ? "/assets/Icons/profile.svg" : userImage as string}
                    alt={`${username} Profile`}
                    layout="fill"
                    className="p-[1px] rounded-full w-full h-full"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col items-center justify-center bg-dark border-dark">
                <DropdownMenuItem className="flex items-center flex-row gap-6 p-6 pr-28">
                    <div className="items-center w-10 justify-center flex">
                        <Image
                            src={userImage === "" ? "/assets/Icons/profile.svg" : userImage as string}
                            alt={`${username} Profile`}
                            width={30}
                            height={30}
                            className="p-[1px] rounded-full transition-all duration-500 w-full h-full"
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                        <h1 className="text-white font-medium text-lg">{username}</h1>
                        <p className="text-secondary font-medium text-md">{userEmail}</p>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="flex flex-row gap-10 items-center p-6 pr-28 hover:bg-secondary/30 cursor-pointer transition-all w-full">
                    <Settings className="text-gray-400 w-16 h-16" size={100} />
                    <span className="text-white font-medium text-md">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex flex-row gap-10 items-center p-6 pr-28 hover:bg-secondary/30 cursor-pointer transition-all w-full">
                    <LogOut className="text-gray-400 w-16 h-16" size={100} />
                    <span className="text-white font-medium text-md">Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default ProfileDropdown;

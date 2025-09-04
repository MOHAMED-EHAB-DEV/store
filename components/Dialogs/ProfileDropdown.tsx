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
    LayoutDashboard,
    Heart,
} from "@/components/ui/svgs/Icons";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

const ProfileDropdown = ({userImage, userRole, username, userEmail, userFavorites}: {
    userImage: string,
    username: String,
    userEmail: String,
    userRole: String,
    userFavorites: Number,
}) => {
    const [open, isOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async (e: ReactMouseEvent<HTMLDivElement>) => {
        try {
            e?.preventDefault();

            const response = await fetch("/api/user/logout");

            const data = await response.json();
            if (!data.success)
                throw new Error(data.message);
            toast("Successfully LoggedOut");
            setTimeout(() => {
                window.location.href = `/`;
            }, 100);
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <DropdownMenu open={open} onOpenChange={isOpen}>
            <DropdownMenuTrigger className="items-center w-10 h-10 outline-none justify-center flex cursor-pointer">
                <Image
                    src={userImage === "" ? "/assets/Icons/profile.svg" : userImage}
                    alt={`${username} Profile`}
                    width={50}
                    height={50}
                    className="p-px rounded-full w-full h-full"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex flex-col items-center justify-center bg-dark border-dark">
                <DropdownMenuItem className="flex items-center flex-row gap-6 p-6 pr-28">
                    <div className="items-center w-10 justify-center flex">
                        <Image
                            src={userImage === "" ? "/assets/Icons/profile.svg" : userImage}
                            alt={`${username} Profile`}
                            width={30}
                            height={30}
                            className="p-px rounded-full transition-all duration-500 w-full h-full"
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                        <h1 className="text-white font-medium text-lg">{username}</h1>
                        <p className="text-secondary font-medium text-md">{userEmail}</p>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(userRole === "admin" ? "/admin" : "/dashboard")} className="flex flex-row gap-10 items-center p-6 pr-28 hover:bg-secondary/30 cursor-pointer transition-all w-full">
                    <LayoutDashboard className="text-gray-400 size-7"/>
                    <span className="text-white font-medium text-md">Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.push("/favorites")}
                    className="flex flex-row gap-10 items-center p-6 pr-28 hover:bg-secondary/30 cursor-pointer transition-all w-full"
                >
                    <div className="relative flex items-center justify-center">
                        <Heart className="text-gray-400 size-7" />
                        {userFavorites > 0 && (
                            <div className="absolute -top-1.5 -right-2 flex items-center justify-center rounded-full text-[10px] font-medium text-white min-w-[18px] min-h-[18px] px-1 bg-[#F48A42]">
                                {userFavorites}
                            </div>
                        )}
                    </div>
                    <span className="text-white font-medium text-md">Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="flex flex-row gap-10 items-center p-6 pr-28 hover:bg-secondary/30 cursor-pointer transition-all w-full">
                    <Settings className="text-gray-400 size-7"/>
                    <span className="text-white font-medium text-md">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex flex-row gap-10 items-center p-6 pr-28 hover:bg-secondary/30 cursor-pointer transition-all w-full">
                    <LogOut className="text-gray-400 size-7"/>
                    <span className="text-white font-medium text-md">Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default ProfileDropdown;

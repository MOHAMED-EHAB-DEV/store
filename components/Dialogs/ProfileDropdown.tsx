import { MouseEvent as ReactMouseEvent, useState } from "react";
import Image from "next/image";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react";
import {
    Settings,
    LogOut,
    LayoutDashboard,
    Heart,
} from "@/components/ui/svgs/Icons";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";

const ProfileDropdown = ({ userImage, userRole, username, userEmail, userFavorites }: {
    userImage: string,
    username: string,
    userEmail: string,
    userRole: string,
    userFavorites: number,
}) => {
    const [open, isOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async (e: ReactMouseEvent<HTMLDivElement>) => {
        // ... same logic
        try {
            // e?.preventDefault(); // HeroUI Item handling might be different, but keeping logi logic

            const response = await fetch("/api/user/logout");

            const data = await response.json();
            if (!data.success)
                throw new Error(data.message);
            sonnerToast.success("Successfully LoggedOut");
            setTimeout(() => {
                window.location.href = `/`;
            }, 100);
        } catch (err) {
            sonnerToast.error("Error logging out. Please try again.");
        }
    }
    return (
        <Dropdown isOpen={open} onOpenChange={isOpen} placement="bottom-end">
            <DropdownTrigger>
                <div className="items-center w-10 h-10 outline-none justify-center flex cursor-pointer">
                    <Image
                        src={userImage === "" ? "/assets/Icons/profile.svg" : userImage}
                        alt={`${username} Profile`}
                        width={50}
                        height={50}
                        className="p-px rounded-full w-full h-full"
                    />
                </div>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="Profile Actions"
                className="w-full bg-dark border-dark"
                itemClasses={{
                    base: "gap-4"
                }}
            >
                <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                    <div className="flex flex-row gap-4 items-center">
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
                    </div>
                </DropdownItem>
                {userRole === "admin" ? (
                    <DropdownItem key="admin" onPress={() => router.push("/admin")} textValue="Admin Dashboard">
                        <div className="flex flex-row gap-10 items-center p-2 pr-28">
                            <LayoutDashboard className="text-gray-400 size-7" />
                            <span className="text-white font-medium text-md">Admin Dashboard</span>
                        </div>
                    </DropdownItem>
                ) : <DropdownItem key="hidden-admin" className="hidden" />}

                <DropdownItem key="dashboard" onPress={() => router.push(`/dashboard`)} textValue="Dashboard">
                    <div className="flex flex-row gap-10 items-center p-2 pr-28">
                        <LayoutDashboard className="text-gray-400 size-7" />
                        <span className="text-white font-medium text-md">Dashboard</span>
                    </div>
                </DropdownItem>

                <DropdownItem key="favorites" onPress={() => router.push("/favorites")} textValue="Favorites">
                    <div className="flex flex-row gap-10 items-center p-2 pr-28">
                        <div className="relative flex items-center justify-center">
                            <Heart className="text-gray-400 size-7" />
                            {userFavorites > 0 && (
                                <div className="absolute -top-1.5 -right-2 flex items-center justify-center rounded-full text-[10px] font-medium text-white min-w-[18px] min-h-[18px] px-1 bg-[#F48A42]">
                                    {userFavorites}
                                </div>
                            )}
                        </div>
                        <span className="text-white font-medium text-md">Favorites</span>
                    </div>
                </DropdownItem>

                <DropdownItem key="settings" onPress={() => router.push('/dashboard/settings')} textValue="Settings">
                    <div className="flex flex-row gap-10 items-center p-2 pr-28">
                        <Settings className="text-gray-400 size-7" />
                        <span className="text-white font-medium text-md">Settings</span>
                    </div>
                </DropdownItem>

                <DropdownItem key="logout" onPress={() => handleLogout({} as any)} textValue="Logout">
                    <div className="flex flex-row gap-10 items-center p-2 pr-28">
                        <LogOut className="text-gray-400 size-7" />
                        <span className="text-white font-medium text-md">Logout</span>
                    </div>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
export default ProfileDropdown;

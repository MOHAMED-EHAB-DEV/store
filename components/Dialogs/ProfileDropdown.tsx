"use client";

import {
  MouseEvent as ReactMouseEvent,
  useState,
} from "react";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";
import { Settings } from "@/components/ui/svgs/icons/Settings";
import { Login } from "../ui/svgs/icons/Login";
import { LogOut } from "@/components/ui/svgs/icons/LogOut";
import { LayoutDashboard } from "@/components/ui/svgs/icons/LayoutDashboard";
import { Heart } from "@/components/ui/svgs/icons/Heart";
import { X } from "@/components/ui/svgs/icons/X";
import { Wrench } from "@/components/ui/svgs/icons/Wrench";
import { useRouter } from "next/navigation";
import { sonnerToast } from "@/components/ui/sonner";
import { IUser } from "@/lib/validations/user";
import Drawer from "@/components/ui/Drawer";

const ProfileDropdown = ({
  user,
  userFavorites,
}: {
  user: IUser | null;
  userFavorites: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  const handleLogout = async (e: ReactMouseEvent<HTMLButtonElement>) => {
    try {
      e?.preventDefault();
      const response = await fetch("/api/user/logout");
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      sonnerToast.success("Successfully Logged Out");
      setTimeout(() => {
        window.location.href = `/`;
      }, 100);
    } catch (err) {
      sonnerToast.error("Error logging out. Please try again.");
    }
  };

  const handleNavigation = (path: string) => {
    closeDrawer();
    setTimeout(() => {
      router.push(path);
    }, 300); // Wait for animation to finish
  };

  return (
    <div className={`relative ${!user ? "flex sm:hidden" : "flex"}`}>
      <button
        onClick={openDrawer}
        aria-label="Open account menu"
        className="items-center w-10 h-10 outline-none justify-center cursor-pointer p-0 bg-transparent border-none rounded-full"
      >
        <Image unoptimized
          src={anyImgUrl(
            user?.avatar ? user.avatar : "/assets/Icons/profile.svg",
            { width: 100, quality: 95, original: user?.avatar ? false : true },
          )}
          alt={`${user?.name || ""} Profile`}
          width={50}
          height={50}
          className="p-px rounded-full w-full h-full hover:scale-105 transition-transform"
        />
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={closeDrawer}
        direction="bottom"
        className="max-w-2xl mx-auto rounded-t-3xl border-t border-x border-white/10 overflow-hidden"
      >
        <div className="p-6 flex flex-col gap-2 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 border-b-[0.5px] border-white/15 pb-3">
            {user ? (
              <div className="flex items-center gap-4">
                <Image unoptimized
                  src={anyImgUrl(
                    user.avatar ? user.avatar : "/assets/Icons/profile.svg",
                    {
                      width: 60,
                      quality: 85,
                      original: user?.avatar ? false : true,
                    },
                  )}
                  alt={`${user.name} Profile`}
                  width={40}
                  height={40}
                  className="p-px rounded-full w-10 h-10"
                />
                <div className="flex flex-col">
                  <h1 className="text-white font-bold text-lg">{user.name}</h1>
                  <p className="text-secondary font-medium text-sm">
                    {user.email}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Image unoptimized
                  src={anyImgUrl("/assets/Icons/profile.svg", {
                    width: 60,
                    quality: 85,
                    original: true,
                  })}
                  alt={`Profile`}
                  width={40}
                  height={40}
                  className="p-px rounded-full w-10 h-10"
                />
                <div className="flex flex-col">
                  <h1 className="text-white font-bold text-lg">Account</h1>
                </div>
              </div>
            )}

            <button
              className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 border-none outline-none bg-transparent cursor-pointer"
              onClick={closeDrawer}
              aria-label="Close account menu"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <button
                    onClick={() => handleNavigation("/admin")}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                  >
                    <LayoutDashboard className="text-gray-400 size-6" />
                    <span className="text-white font-medium text-base">
                      Admin Dashboard
                    </span>
                  </button>
                )}
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <LayoutDashboard className="text-gray-400 size-6" />
                  <span className="text-white font-medium text-base">
                    Dashboard
                  </span>
                </button>
                <button
                  onClick={() => handleNavigation("/favorites")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <div className="relative flex items-center justify-center">
                    <Heart className="text-gray-400 size-6" />
                    {userFavorites > 0 && (
                      <div className="absolute -top-1.5 -right-2 flex items-center justify-center rounded-full text-[10px] font-bold text-white min-w-[18px] min-h-[18px] px-1 bg-[#F48A42]">
                        {userFavorites}
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium text-base">
                    Favorites
                  </span>
                </button>
                <button
                  onClick={() => handleNavigation("/dashboard/settings")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <Settings className="text-gray-400 size-6" />
                  <span className="text-white font-medium text-base">
                    Settings
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <LogOut className="text-gray-400 size-6" />
                  <span className="text-white font-medium text-base">
                    Logout
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <Login className="text-gray-400 size-6" />
                  <span className="text-white font-medium text-base">
                    Signin
                  </span>
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <Login className="text-gray-400 size-6" />
                  <span className="text-white font-medium text-base">
                    Register
                  </span>
                </button>
                <button
                  onClick={() => handleNavigation("/custom-development")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors w-full text-left outline-none"
                >
                  <Wrench className="text-gray-400 size-6" />
                  <span className="text-white font-medium text-base">
                    Custom Development
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
export default ProfileDropdown;

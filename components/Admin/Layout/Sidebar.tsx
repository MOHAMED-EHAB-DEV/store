"use client";

import React, {
  MouseEvent as ReactMouseEvent,
  useState,
  useTransition,
} from "react";
import { X } from "@/components/ui/svgs/icons/X";
import { ChevronUp } from "@/components/ui/svgs/icons/ChevronUp";
import { ChevronDown } from "@/components/ui/svgs/icons/ChevronDown";
import { LogOut } from "@/components/ui/svgs/icons/LogOut";
import Logo from "@/components/ui/Logo";
import { AdminSidebarLinks } from "@/constants/navigation";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { anyImgUrl } from "@/lib/utils/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home } from "@/components/ui/svgs/icons/Home";
import { sonnerToast } from "@/components/ui/sonner";
import { IUser } from "@/lib/validations/user";
import NotificationCenter from "@/components/shared/NotificationCenter";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/ui/svgs/icons/Menu";

const Sidebar = ({ user }: { user: IUser }) => {
  const router = useRouter();
  const path = usePathname();

  const [open, setOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingLink, setLoadingLink] = useState("");
  const [isLoading, startTransition] = useTransition();

  const currentPage =
    AdminSidebarLinks.find((l) => l.link === path)?.text ?? "Admin";

  const handleLogout = async (e: ReactMouseEvent<HTMLDivElement>) => {
    try {
      e?.preventDefault();
      const response = await fetch("/api/user/logout");
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      sonnerToast.success("Successfully LoggedOut");
      setTimeout(() => {
        window.location.href = `/`;
      }, 100);
    } catch (err) {
      sonnerToast.error((err as Error).message);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 start-0 w-full h-14 bg-dark/90 backdrop-blur-md flex items-center justify-between px-4 z-40 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <span className="text-white font-bold text-lg">{currentPage}</span>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`lg:start-0 z-50 w-[18rem] bg-dark flex flex-col md:p-8 p-4 justify-between h-screen fixed top-0 overflow-auto transition-[inset-inline-start] duration-300 ${
          open ? "start-0" : "-start-72"
        }`}
      >
        <div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            className="bg-transparent cursor-pointer flex items-center justify-center lg:hidden rounded-full absolute top-2 end-2 p-4"
          >
            <X />
          </button>

          <div className="flex items-center gap-4">
            <Logo onClick={() => router.push("/")} />
            <h1 className="text-white font-bold text-2xl">Admin</h1>
          </div>

          <div className="flex flex-col gap-1 md:mt-14 mt-10">
            {AdminSidebarLinks.map(({ Icon, text, link }, idx) => (
              <Button
                key={idx}
                onClick={() => {
                  setLoadingLink(link);
                  startTransition(() => {
                    router.push(link);
                    setOpen(false);
                  });
                }}
                loading={isLoading && loadingLink === link}
                className={`w-full h-10 cursor-pointer transition-all px-5 py-3 rounded-md flex gap-3 items-center justify-start ${
                  link === path ? "bg-white/10" : "hover:bg-white/10 bg-transparent"
                }`}
              >
                {isLoading && loadingLink === link ? (
                  <Spinner />
                ) : (
                  <Icon className="w-5 h-5 text-white" />
                )}
                <span className={`text-white text-sm ${link === path ? "font-bold" : ""}`}>
                  {text}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-1 w-full h-20">
          <div className="h-1 absolute top-0 left-0 w-full rounded-full bg-white/10" />
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="px-3 py-2 hover:bg-white/10 outline-none border-none flex items-center justify-center gap-3 rounded-lg transition-all duration-400 cursor-pointer">
              <div className="w-7 h-7 flex items-center justify-center">
                <Image
                  unoptimized
                  src={anyImgUrl(
                    user?.avatar === ""
                      ? "/assets/Icons/profile.svg"
                      : (user?.avatar as string),
                    { width: 60, quality: 85, original: user?.avatar ? false : true }
                  )}
                  alt={`${user?.name} Profile`}
                  width={30}
                  height={30}
                  className="p-px rounded-full transition-all duration-500 w-full h-full border hover:border-white"
                />
              </div>
              <div className="flex gap-1 items-center">
                <h1 className="text-md font-semibold text-white">
                  {user?.name.split(" ")[0]}
                </h1>
              </div>
              {isDropdownOpen ? <ChevronUp /> : <ChevronDown />}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-dark z-50">
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="flex flex-row gap-4 px-4 py-3 items-center hover:bg-secondary/30 cursor-pointer transition-all w-full"
              >
                <Home />
                <span className="text-white font-medium text-md">Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex flex-row gap-4 px-4 py-3 items-center hover:bg-secondary/30 cursor-pointer transition-all w-full"
              >
                <LogOut />
                <span className="text-white font-medium text-md">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationCenter />
        </div>
      </div>
    </>
  );
};

export default Sidebar;

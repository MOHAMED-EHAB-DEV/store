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
import { createImageProxyLoader } from "@/lib/utils/image";
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
      sonnerToast.success("Successfully Logged Out");
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`lg:start-0 z-50 w-[18rem] bg-dark/95 backdrop-blur-2xl border-e border-white/[0.08] flex flex-col justify-between h-screen fixed top-0 overflow-y-auto transition-[inset-inline-start] duration-300 ${
          open ? "start-0" : "-start-72"
        }`}
      >
        <div className="flex flex-col flex-1 px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-3">
              <Logo onClick={() => router.push("/")} />
              <div className="flex flex-col">
                <h1 className="text-white font-bold text-xl tracking-tight">
                  Admin
                </h1>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden p-2 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
            {AdminSidebarLinks.map(({ Icon, text, link }, idx) => {
              const isActive = link === path;
              const isItemLoading = isLoading && loadingLink === link;

              return (
                <Button
                  key={idx}
                  onClick={() => {
                    setLoadingLink(link);
                    startTransition(() => {
                      router.push(link);
                      setOpen(false);
                    });
                  }}
                  loading={isItemLoading}
                  className={`group relative w-full h-11 cursor-pointer transition-all duration-200 px-4 rounded-xl flex gap-3.5 items-center justify-start ${
                    isActive
                      ? "bg-white/[0.09] text-white shadow-sm border-s-2 border-primary"
                      : "bg-transparent text-white/70 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {isItemLoading ? (
                    <Spinner className="w-5 h-5" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`}
                    />
                  )}
                  <span
                    className={`text-sm tracking-wide transition-all ${isActive ? "font-semibold text-white" : "font-medium"}`}
                  >
                    {text}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Sticky User Details Footer */}
        <div className="sticky bottom-0 p-3 bg-dark/95 backdrop-blur-xl border-t border-white/[0.06] grid items-center grid-cols-[80%_20%] gap-2">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all duration-200 flex items-center justify-between gap-2.5 outline-none cursor-pointer group">
              <div className="relative flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Image
                    src={
                      user?.avatar ||
                      "https://res.cloudinary.com/ju8d58lo/image/upload/v1784997453/profile_zwcsy4.svg"
                    }
                    loader={createImageProxyLoader(!user?.avatar)}
                    alt={`${user?.name || "Admin"} Profile`}
                    width={34}
                    height={34}
                    className="rounded-full object-cover ring-2 ring-primary/40 group-hover:ring-primary transition-all duration-300"
                  />
                  <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-dark" />
                </div>
                <div className="flex flex-col text-start min-w-0">
                  <h1 className="text-sm font-semibold text-white truncate transition-colors">
                    {user?.name}
                  </h1>
                  <span className="text-[11px] text-white/50 truncate font-medium">
                    {user?.email || "Administrator"}
                  </span>
                </div>
              </div>
              <div className="text-white/50 group-hover:text-white transition-colors shrink-0">
                {isDropdownOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-dark/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl w-56 z-50">
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4 text-white/80 group-hover:text-white" />
                <span className="font-medium text-sm">Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500 group-hover:text-rose-600" />
                <span className="font-medium text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationCenter triggerClassName="shrink-0 bg-white/[0.04] h-full flex items-center justify-center p-1.5 rounded-xl border border-white/10" />
        </div>
      </div>
    </>
  );
};

export default Sidebar;

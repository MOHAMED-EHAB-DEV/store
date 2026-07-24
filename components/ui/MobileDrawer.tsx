"use client";

import { Menu } from "@/components/ui/svgs/icons/Menu";
import { X } from "@/components/ui/svgs/icons/X";
import { useState } from "react";
import { NavigationLinks } from "@/constants/navigation";
import Link from "next/link";
import Drawer from "@/components/ui/Drawer";

const MobileDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <div className="relative md:hidden block ms-2 self-end">
      <button
        aria-label="Menu Button"
        className="p-3 bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200 active:scale-95 border-none outline-none cursor-pointer"
        onClick={openDrawer}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      <Drawer
        isOpen={isOpen}
        onClose={closeDrawer}
        direction="right"
        className="w-3/4 sm:w-2/4 bg-dark/95 backdrop-blur-xl shadow-2xl border-s border-white/10"
      >
        <div className="p-6 flex flex-col h-full gap-6 overflow-y-auto">
          <button
            className="p-3 mb-4 hover:bg-white/10 rounded-full w-fit transition-colors duration-200 active:scale-95 bg-transparent border-none outline-none cursor-pointer"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {NavigationLinks.map(({ id, link, text }) => (
              <li key={id}>
                <Link
                  href={link}
                  className="block text-white hover:text-secondary hover:bg-white/10 text-xl font-medium p-4 rounded-lg transition-all duration-200 active:scale-95 outline-none focus:ring-2 focus:ring-white/20"
                  onClick={closeDrawer}
                >
                  {text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </div>
  );
};

export default MobileDrawer;
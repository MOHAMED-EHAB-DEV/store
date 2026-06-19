"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/shared/NotificationCenter";
import { NavigationLinks } from "@/constants";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Loader from "@/components/ui/Loader";
import { useUser } from "@/context/UserContext";
import { IUser } from "@/types";
import { sendGTMEvent } from "@next/third-parties/google";
import dynamic from "next/dynamic";

const ProfileDropdown = dynamic(() => import("@/components/Dialogs/ProfileDropdown"));
const MobileDrawer = dynamic(() => import("./MobileDrawer"), { ssr: false });

const Navbar = () => {
  const router = useRouter();
  const { user, favoriteTemplates } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`z-40 w-12/13 md:w-4/5 self-center mt-1 top-0 fixed transition-all rounded-4xl duration-500 ease-in-out translate-y-0 opacity-100 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-xl shadow-2xl border border-white/10 scale-[0.98]"
          : "bg-primary/50 backdrop-blur-lg shadow-lg border border-white/5"
      }`}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "py-6" : "py-8"
        }`}
      >
        <Logo
          onClick={() => router.push("/")}
          className={!user ? "flex-1" : ""}
        />

        <nav
          className={`md:flex hidden ${user && "md:flex-1"} flex-row gap-4 items-center justify-center`}
          aria-label="Main Navigation"
        >
          <ul className="flex flex-row gap-4 items-center justify-center">
            {NavigationLinks.map(({ id, text, link }) => (
              <li key={id}>
                <NavbarItem text={text} link={link} />
              </li>
            ))}
          </ul>
        </nav>
        <div className={`flex gap-2 ${!user && "flex-1 justify-end"}`}>
          <MobileDrawer user={user as IUser} />
          {!user && (
            <div className="hidden sm:flex gap-2 items-center justify-end">
              <Link
                className="outline-none cursor-pointer hover:scale-105 transition-all duration-300 border-none bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 px-8 py-3 rounded-full text-white font-bold text-base shadow-xl hover:shadow-purple-500/25"
                aria-label="Get Started button"
                href="/register"
                onClick={() =>
                  sendGTMEvent({ event: "auth_nav_click", auth_type: "signup" })
                }
              >
                Signup
              </Link>
            </div>
          )}
          <Suspense fallback={<Loader />}>
            <div className="flex items-center justify-end gap-2">
              {user && <NotificationCenter />}
              <ProfileDropdown
                user={user}
                userFavorites={favoriteTemplates.length}
              />
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
};
export default Navbar;

const NavbarItem = ({ text, link }: { text: string; link: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link
      href={link}
      className="decoration-none flex flex-col gap-[2px] items-center w-fit justify-center text-secondary hover:text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() =>
        sendGTMEvent({
          event: "nav_link_click",
          nav_label: text,
          nav_path: link,
        })
      }
    >
      {text}
      <div
        className={`w-0 h-[2px] ${isHovered && "w-full!"} bg-linear-to-r from-[#8BFA9E] to-[#3FD6DD] rounded-[2px] transition-all duration-300 ease-out`}
      />
    </Link>
  );
};

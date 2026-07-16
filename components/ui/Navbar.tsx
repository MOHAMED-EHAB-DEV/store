"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NavigationLinks } from "@/constants";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useUser } from "@/context/UserContext";
import { sendGTMEvent } from "@next/third-parties/google";
import dynamic from "next/dynamic";

const ProfileDropdown = dynamic(
  () => import("@/components/Dialogs/ProfileDropdown"),
);
const NotificationCenter = dynamic(() => import("@/components/shared/NotificationCenter"))
const MobileDrawer = dynamic(() => import("./MobileDrawer"), { ssr: false });

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isCustomDev = pathname === "/custom-development";
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
    <header
      className={`navbar z-50 fixed top-2 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full ${
        scrolled
          ? isCustomDev
            ? "bg-black/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 py-3 mt-0"
            : "bg-primary/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 py-3 mt-0"
          : isCustomDev
            ? "bg-transparent border border-transparent py-4 mt-2"
            : "bg-primary/40 backdrop-blur-md shadow-lg border border-white/5 py-4 mt-2"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-8">
        <Logo
          onClick={() => router.push("/")}
          className={!user ? "md:flex-1" : ""}
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
          <MobileDrawer />
          {!user && (
            <div className="hidden sm:flex gap-2 items-center justify-end">
              <Link
                className="text-secondary hover:text-white font-bold text-base px-4 py-3 transition-colors cursor-pointer"
                aria-label="Login button"
                href="/login"
                onClick={() =>
                  sendGTMEvent({ event: "auth_nav_click", auth_type: "login" })
                }
              >
                Login
              </Link>
              <Link
                className="outline-none cursor-pointer hover:scale-105 transition-all duration-300 border-none bg-linear-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-400 hover:via-pink-400 hover:to-cyan-400 px-6 md:px-8 py-2.5 md:py-3.5 rounded-full text-white font-bold text-sm md:text-base shadow-xl hover:shadow-purple-500/25 whitespace-nowrap"
                aria-label="Get Started button"
                href={
                  scrolled && !isCustomDev ? "/custom-development" : "/register"
                }
                onClick={() =>
                  sendGTMEvent({ event: "auth_nav_click", auth_type: "signup" })
                }
              >
                <span className="relative inline-grid items-center justify-items-center">
                  <span
                    className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${scrolled && !isCustomDev ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                  >
                    Work with Me
                  </span>
                  <span
                    className={`col-start-1 row-start-1 transition-all duration-500 ease-in-out ${!(scrolled && !isCustomDev) ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
                  >
                    Signup
                  </span>
                </span>
              </Link>
            </div>
          )}
          <Suspense fallback={
            <div className="relative p-2 rounded-xl opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          }>
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
    </header>
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

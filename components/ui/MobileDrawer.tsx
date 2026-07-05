"use client";

import { Menu } from "@/components/ui/svgs/icons/Menu";
import { X } from "@/components/ui/svgs/icons/X";
import { useState, useRef } from "react";
import { NavigationLinks } from "@/constants";
import Link from "next/link";
import { IUser } from "@/types";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const MobileDrawer = ({ user }: { user: IUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const openDrawer = () => {
    setIsRendered(true);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsRendered(false);
        setIsOpen(false);
      }
    });

    tl.to(drawerRef.current, {
      x: "100%",
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
    });
    tl.to(backdropRef.current, {
      opacity: 0,
      duration: 0.2,
    }, "<");
  };

  useGSAP(() => {
    if (isOpen && drawerRef.current && backdropRef.current) {
      gsap.set(drawerRef.current, { x: "100%", opacity: 0 });
      gsap.set(backdropRef.current, { opacity: 0 });

      const tl = gsap.timeline();

      tl.to(drawerRef.current, {
        x: 5,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      });

      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
      }, "<");
    }
  }, [isOpen]);

  return (
    <div className="relative md:hidden block ms-2 self-end">
      <button
        aria-label="Menu Button"
        className="p-3 bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200 active:scale-95"
        onClick={openDrawer}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {isRendered && (
        <div>
          <div
            ref={backdropRef}
            onClick={closeDrawer}
            className="fixed inset-0 z-50 w-screen h-screen bg-black/40 backdrop-blur-lg"
          ></div>

          <div
            ref={drawerRef}
            className="fixed top-0 end-0 h-screen w-3/4 sm:w-2/4 bg-dark/95 backdrop-blur-xl shadow-2xl z-9999999 border-s border-white/10"
          >
            <div className="p-6 flex flex-col h-full gap-6">
              <button
                className="p-3 mb-4 hover:bg-white/10 rounded-full w-fit transition-colors duration-200 active:scale-95"
                onClick={closeDrawer}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <ul className="flex flex-col gap-2">
                {NavigationLinks.map(({ id, link, text }) => (
                  <li key={id}>
                    <Link
                      href={link}
                      className="block text-white hover:text-secondary hover:bg-white/10 text-xl font-medium p-4 rounded-lg transition-all duration-200 active:scale-95"
                      onClick={closeDrawer}
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDrawer;
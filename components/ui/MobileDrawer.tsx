import { Menu } from "@/components/ui/svgs/icons/Menu";
import { X } from "@/components/ui/svgs/icons/X";
import { motion } from "motion/react";
import { useState } from "react";
import { NavigationLinks } from "@/constants";
import Link from "next/link";
import { IUser } from "@/types";

const MobileDrawer = ({ user }: { user: IUser }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative md:hidden block ml-2 self-end">
      <button
        aria-label="Menu Button"
        className="p-3 bg-transparent hover:bg-white/10 rounded-full transition-colors duration-200 active:scale-95"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {isOpen && (
        <div>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 w-screen h-screen bg-black/40 backdrop-blur-lg"
          ></div>

          <motion.div
            className="fixed top-0 right-0 h-screen w-3/4 sm:w-2/4 bg-dark/95 backdrop-blur-xl shadow-2xl z-9999999 border-l border-white/10"
            variants={{
              hidden: { x: "100%", opacity: 0 },
              visible: {
                x: 5,
                opacity: 1,
                transition: { type: "spring", stiffness: 400, damping: 30 },
              },
              exit: {
                x: "100%",
                opacity: 0,
                transition: { type: "spring", stiffness: 400, damping: 30 },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-6 flex flex-col h-full gap-6">
              <button
                className="p-3 mb-4 hover:bg-white/10 rounded-full w-fit transition-colors duration-200 active:scale-95"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <ul className="flex flex-col gap-2">
                {NavigationLinks.map(({ id, link, text }) => (
                  <li key={id}>
                    <Link
                      href={link}
                      className="block text-white hover:text-secondary hover:bg-white/10 text-xl font-medium p-4 rounded-lg transition-all duration-200 active:scale-95"
                      onClick={() => setIsOpen(false)}
                    >
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MobileDrawer;
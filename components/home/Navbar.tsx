'use client';

import {useState, useEffect} from 'react';
import {MenuIcon, XIcon} from 'lucide-react';
import * as m from 'motion/react-m';
import {LazyMotion, domAnimation} from "motion/react";
import { useRouter } from "next/navigation";

import {NavigationLinks} from "@/constants";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

const Navbar = () => {
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div
            className={`z-50 w-12/13 md:w-4/5 self-center mt-2 top-0 fixed transition-all rounded-full duration-500 ease-in-out ${
                isMounted ? "translate-y-0 opacity-100 bg-primary/70 backdrop-blur-lg shadow-lg" : "-translate-y-full bg-transparent"
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-8 flex items-center py-8 relative">
                <Logo onClick={() => router.push("/")} className="flex-1" />

                <nav className="sm:flex hidden flex-row gap-6 items-center justify-center">
                    {NavigationLinks.map(({id, text, link}) => (
                        <NavbarItem text={text} link={link} key={id}/>
                    ))}
                </nav>

                <div className="flex flex-1 gap-2 items-center justify-end">
                    <button
                        className="outline-none hidden sm:block cursor-pointer hover:scale-105 transition-all duration-500 border-none hover:bg-glass px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                        aria-label="Signin button"
                    >
                        Signin
                    </button>
                    <button
                        className="outline-none hidden sm:block cursor-pointer hover:scale-105 transition-all duration-500 border-none bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                        aria-label="Signup button"
                    >
                        Get Started
                    </button>
                </div>

                <MobileDrawer />
            </div>
        </div>
    );
};
export default Navbar;

const NavbarItem = ({text, link}: { text: string, link: string }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link
            href={link}
            className="decoration-none flex flex-col gap-[2px] items-center w-fit justify-center text-secondary hover:text-white"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {text}
            <div
                className={`w-0 h-[2px] ${isHovered && "!w-full"} bg-gradient-to-r from-[#8BFA9E] to-[#3FD6DD] rounded-[2px] transition-all duration-300 ease-out`}
            />
        </Link>
    );
};

const MobileDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative sm:hidden block ml-2">
            <button aria-label="Menu Button" className="p-2 bg-transparent" onClick={() => setIsOpen(true)}>
                <MenuIcon />
            </button>

            {isOpen && (
                <div>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <LazyMotion features={domAnimation}>
                        <m.div
                            className="fixed top-0 right-0 h-full w-2/4 bg-dark shadow-lg z-50"
                            variants={{
                                hidden: { x: "100%", opacity: 0 },
                                visible: {
                                    x: 0,
                                    opacity: 1,
                                    transition: { type: "spring", stiffness: 300, damping: 25 },
                                },
                                exit: {
                                    x: "100%",
                                    opacity: 0,
                                    transition: { type: "spring", stiffness: 300, damping: 25 },
                                },
                            }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="p-4 flex flex-col h-full gap-4">
                                <button className="p-2 mb-2" onClick={() => setIsOpen(false)}>
                                    <XIcon />
                                </button>
                                <ul className="flex flex-col">
                                    {NavigationLinks.map(({id, link, text}) => (
                                        <li className="p-2" key={id}>
                                            <Link
                                                href={link}
                                                className="text-white flex hover:text-secondary text-lg"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {text}
                                            </Link>
                                        </li>
                                    ))}
                                        <button
                                            className="outline-none cursor-pointer hover:scale-105 transition-all duration-500 border-none hover:bg-glass px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                                            aria-label="Signin button"
                                        >
                                            Signin
                                        </button>
                                        <button
                                            className="outline-none cursor-pointer hover:scale-105 transition-all duration-500 border-none bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                                            aria-label="Signup button"
                                        >
                                            Get Started
                                        </button>
                                </ul>
                            </div>
                        </m.div>
                    </LazyMotion>
                </div>
            )}
        </div>
    );
};

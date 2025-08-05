'use client';

import {useState, useEffect, Suspense} from 'react';
import {Menu, X} from '@/components/ui/svgs/Icons';
import {motion} from "motion/react";
import {useRouter} from "next/navigation";
import ProfileDropdown from "@/components/Dialogs/ProfileDropdown";
import {NavigationLinks} from "@/constants";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import UILoader from "@/components/ui/UILoader";

const Navbar = ({user}: { user: IUser | undefined }) => {
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div
            className={`z-50 w-12/13 md:w-4/5 self-center mt-1 top-0 fixed transition-all rounded-full duration-800 ease-in-out translate-y-0 opacity-100 bg-primary/70 backdrop-blur-lg shadow-lg`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-8 flex items-center py-8">
                <Logo onClick={() => router.push("/")} className="flex-1"/>

                <nav className="sm:flex hidden flex-row gap-6 items-center justify-center">
                    {NavigationLinks.map(({id, text, link}) => (
                        <NavbarItem text={text} link={link} key={id}/>
                    ))}
                </nav>
                <MobileDrawer/>
                {!user ? <div className="hidden sm:flex flex-1 gap-2 items-center justify-end">
                    <Link
                        className="outline-none cursor-pointer hover:scale-105 transition-all duration-500 border-none hover:bg-glass px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                        aria-label="Signin button"
                        // onClick={() => router.push("/signin")}
                        href="/signin"
                    >
                        Signin
                    </Link>
                    <Link
                        className="outline-none cursor-pointer hover:scale-105 transition-all duration-500 border-none bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                        aria-label="Signup button"
                        // onClick={() => router.push("/register")}
                        href="/register"
                    >
                        Get Started
                    </Link>
                </div> : (
                    <Suspense fallback={<UILoader/>}>
                        <div className="flex md:flex-1 items-center justify-end">
                            <ProfileDropdown username={user.name} userImage={user.avatar as String}
                                             userEmail={user.email} userRole={user?.role as String}/>
                        </div>
                    </Suspense>
                )}
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
        <div className="relative sm:hidden block ml-2 self-end">
            <button aria-label="Menu Button" className="p-2 bg-transparent" onClick={() => setIsOpen(true)}>
                <Menu/>
            </button>

            {isOpen && (
                <div>
                    <div
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-40 w-screen h-screen bg-black/40 backdrop-blur-lg"
                    ></div>

                    <motion.div
                        className="fixed top-0 right-0 h-screen w-2/4 bg-dark shadow-lg z-50"
                        variants={{
                            hidden: {x: "100%", opacity: 0},
                            visible: {
                                x: 0,
                                opacity: 1,
                                transition: {type: "spring", stiffness: 300, damping: 25},
                            },
                            exit: {
                                x: "100%",
                                opacity: 0,
                                transition: {type: "spring", stiffness: 300, damping: 25},
                            },
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="p-4 flex flex-col h-full gap-4">
                            <button className="p-2 mb-2" onClick={() => setIsOpen(false)}>
                                <X/>
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
                    </motion.div>
                </div>
            )}
        </div>
    );
};

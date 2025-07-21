'use client';

import {useState, useEffect} from 'react';
import {MenuIcon, XIcon} from 'lucide-react';
import {motion} from 'motion/react';
import { useRouter } from "next/navigation";

import {NavbarLinks} from "@/constants";
import Link from "next/link";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`z-50 flex items-center justify-between py-8 max-w-7xl w-full mx-auto ${isScrolled && "fixed top-0 bg-dark"}`}>
            <div className="flex items-center justify-center p-2 h-10 w-12 gap-1 hover:rotate-360 cursor-pointer" onClick={() => router.push("/")}>
                <div className="w-1/3 h-full bg-white"/>
                <div className="flex w-full h-full flex-col gap-1">
                    <div className="w-3 h-3 bg-white"/>
                    <div className="w-3 h-3 bg-white"/>
                </div>
            </div>
            <div className="sm:flex hidden flex-row gap-4 items-center justify-center w-fit">
                {NavbarLinks.map(({id, text, link}) => <NavbarItem text={text} link={link} key={id}/>)}
            </div>

            <div className="flex gap-2 items-center justify-center">
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
    )
}
export default Navbar;

const NavbarItem = ({text, link}: { text: string, link: string, }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <Link href={link}
              className="decoration-none flex flex-col gap-[2px] items-center w-fit justify-center text-secondary hover:text-white"
              onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {text}
            <div
                className={`w-0 h-[2px] ${isHovered && "!w-full"} bg-gradient-to-r from-[#8BFA9E] to-[#3FD6DD] rounded-[2px] transition-all duration-300 ease-out`}/>
        </Link>
    )
};

const MobileDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative sm:hidden block">
            <button aria-label="Menu Button" className="p-2 bg-transparent" onClick={() => setIsOpen(true)}>
                <MenuIcon />
            </button>

            {isOpen && (
                <div>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <motion.div
                        className="fixed top-0 right-0 h-full w-2/4 bg-dark shadow-lg z-50"
                        variants={{
                            hidden: {
                                x: "100%",
                                opacity: 0,
                            },
                            visible: {
                                x: 0,
                                opacity: 1,
                                transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                },
                            },
                            exit: {
                                x: "100%",
                                opacity: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                },
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
                            <ul className={`flex flex-col-reverse`}>
                                <button
                                    className="outline-none cursor-pointer hover:scale-105 transition-transform duration-500 border-none bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg"
                                >
                                    Get Started
                                    {/*{current.button}*/}
                                </button>
                                {NavbarLinks.map(({id, link, text}) => (
                                    <li className="p-2" key={id}>
                                        <Link
                                            href={link}
                                            key={id}
                                            className={`text-white flex hover:text-secondary text-lg`}
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

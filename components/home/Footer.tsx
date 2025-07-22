import Image from "next/image";
import Logo from "@/components/ui/Logo";
import {socialImgs, NavigationLinks} from "@/constants";

const Footer = () => {
    return (
        <footer className="w-[100dvw] bg-dark">
            <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row py-4 px-3 items-center justify-between gap-4">
                <div className="flex flex-col md:items-start items-center gap-6 w-full md:w-[269px]">
                    <div className="flex items-center justify-center md:items-start md:justify-start flex-col gap-1">
                        <Logo />
                        <p className="font-medium text-secondary text-center md:text-left">Premium Templates for creative entrepreneurs</p>
                    </div>
                    <div className="flex gap-2 w-fit flex-row items-center justify-center">
                        {socialImgs.map((socialImg, index) => (
                            <a key={index} target="_blank" href={socialImg.link} className="icon">
                                <Image src={socialImg.imgPath} alt="social icon" width={25} height={25} />
                            </a>
                        ))}
                    </div>
                    <p className="text-secondary font-bold">
                       Copyright © {new Date().getFullYear()} Mohammed Ehab.
                    </p>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-3">
                        <h3 className="text-white font-medium text-lg">Navigation</h3>
                        <ul className="flex flex-col gap-2">
                            {NavigationLinks.map(({id, text, link}) => (
                                <li className="text-secondary font-medium" key={id}>
                                    <a href={link}>{text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    )
}
export default Footer

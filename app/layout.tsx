import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";

gsap.registerPlugin(useGSAP);

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mohammed Ehab - Templates",
    description: "Mohammed Ehab store",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com"/>
            <link
                href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Parastoo:wght@400..700&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                rel="stylesheet"/>
        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
        >
        <div className="h-screen w-screen bg-primary text-white px-5 flex flex-col items-center justify-start overflow-x-hidden">
            <Navbar/>
            {children}
        </div>
        </body>
        </html>
    );
}

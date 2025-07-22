import type {Metadata} from "next";
import "./globals.css";
import Navbar from "@/components/home/Navbar";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {Roboto} from "@/lib/fonts";
import {Analytics} from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/home/Footer";

gsap.registerPlugin(useGSAP);

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
        <body
            className={`${Roboto.className} antialiased scroll-smooth`}
        >
            <div
                className="h-screen w-screen bg-primary text-white px-5 flex flex-col items-center gap-3 justify-start overflow-x-hidden">
                <Navbar/>
                {children}
                <Footer />
            </div>
            <Analytics />
            <SpeedInsights />
        </body>
        </html>
    );
}

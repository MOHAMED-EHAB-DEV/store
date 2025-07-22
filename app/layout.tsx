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
    metadataBase: new URL('https://mhd-store.vercel.app/'),
    title: "Mohammed Ehab - Premium Templates Store | Modern Web Templates",
    description: "Discover premium, responsive web templates built with React, Next.js, and Tailwind CSS. Perfect for SaaS, e-commerce, portfolios, and agencies. Created by Mohammed Ehab.",
    keywords: "web templates, React templates, Next.js templates, Tailwind CSS, premium templates, responsive design, SaaS templates, e-commerce templates, portfolio templates, agency templates",
    authors: [{ name: "Mohammed Ehab" }],
    creator: "Mohammed Ehab",
    publisher: "Mohammed Ehab Templates",
    robots: "index, follow",
    openGraph: {
        title: "Mohammed Ehab - Premium Templates Store",
        description: "Premium, responsive web templates for modern businesses and creators",
        url: "https://mhd-store.vercel.app",
        siteName: "Mohammed Ehab Templates",
        images: [
            {
                url: "/assets/images/Logo.png",
                width: 1200,
                height: 630,
                alt: "Mohammed Ehab Premium Templates",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mohammed Ehab - Premium Templates Store",
        description: "Premium, responsive web templates for modern businesses and creators",
        images: ["/assets/illustration/background_pattern.png"],
        creator: "@__M__O__H__",
    },
    icons: "/assets/images/Logo.png",
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

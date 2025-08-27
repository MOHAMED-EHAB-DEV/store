import type {Metadata} from "next";
import "./globals.css";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {Roboto} from "@/lib/fonts";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import {Toaster} from "@/components/ui/sonner";
import Head from 'next/head';
import BackToTop from "@/components/ui/BackToTop";
import {cn} from "@/lib/utils";
import Providers from "./Providers";

gsap.registerPlugin(useGSAP);

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        {media: '(prefers-color-scheme: light)', color: '#0D0F19'},
        {media: '(prefers-color-scheme: dark)', color: '#0D0F19'}
    ],
    colorScheme: 'dark'
};

export const metadata: Metadata = {
    metadataBase: new URL('https://mhd-store.vercel.app/'),
    title: "Mohammed Ehab - Premium Templates Store | Modern Web Templates",
    description: "Discover premium, responsive web templates built with React, Next.js, and Tailwind CSS. Perfect for SaaS, e-commerce, portfolios, and agencies. Created by Mohammed Ehab.",
    keywords: "web templates, React templates, Next.js templates, Tailwind CSS, premium templates, responsive design, SaaS templates, e-commerce templates, portfolio templates, agency templates",
    authors: [{name: "Mohammed Ehab"}],
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
                url: "/assets/Icons/Logo.svg",
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
        images: ["/assets/Icons/Logo.svg"],
        creator: "@__M__O__H__",
    },
    icons: "/assets/Icons/Logo.svg",
    verification: {
        google: process.env.google_verification_code!,
    },
    alternates: {
        canonical: "https://mhd-store.vercel.app",
    },
};

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <Providers>
            <html lang="en" className="scroll-smooth">
            <Head>
                <link rel="preload" as="image" href="/assets/Icons/cursor.avif" type="image/avif"/>
                <link rel="preload" as="image" href="/assets/Icons/publish.webp" type="image/webp"/>
                <link rel="preload" as="font" href="/assets/fonts/Parastoo/Parastoo-VariableFont_wght.ttf" type="font/ttf" crossOrigin="anonymous"/>
                <link rel="preload" as="font" href="/assets/fonts/Parastoo/static/Parastoo-Regular.ttf" type="font/ttf" crossOrigin="anonymous"/>
                <link rel="preload" as="font" href="/assets/fonts/Parastoo/static/Parastoo-Medium.ttf" type="font/ttf" crossOrigin="anonymous"/>
                <link rel="preload" as="font" href="/assets/fonts/Parastoo/static/Parastoo-Bold.ttf" type="font/ttf" crossOrigin="anonymous"/>
            </Head>
            <body
                className={cn("antialiased scroll-smooth bg-primary text-white", Roboto.className)}
            >
            <Toaster/>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md z-50 transition-all duration-200"
            >
                Skip to main content
            </a>

            <div className="min-h-screen min-w-screen h-full w-full relative overflow-x-hidden">
                {/* Enhanced background with multiple gradients */}
                <div className="fixed inset-0 -z-10">
                    {/* Primary background */}
                    <div className="absolute inset-0 bg-primary"/>

                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-dark to-primary opacity-90"/>

                    {/* Animated gradient orbs */}
                    <div
                        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl animate-float"/>
                    <div
                        className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-float"
                        style={{animationDelay: '2s'}}/>
                    <div
                        className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-green-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl animate-float"
                        style={{animationDelay: '4s'}}/>

                    {/* Subtle radial gradient pattern */}
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 50% 50%, rgba(119, 255, 198, 0.05) 0%, transparent 50%)`
                        }}
                    />
                </div>

                {children}
            </div>

            <Analytics/>
            <SpeedInsights/>
            <BackToTop />
            </body>
            </html>
        </Providers>
    );
}

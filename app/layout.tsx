import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Roboto } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Providers from "./Providers";
import { PersonSchema } from "@/components/SEO/StructuredData";
import GTMPageView from "@/hooks/GTMPageView";
import Script from "next/script";

const BackToTop = dynamic(() => import("@/components/ui/BackToTop"));

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0D0F19" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0F19" },
  ],
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mhd-store.vercel.app/"),
  title: "Mohammed Ehab - Premium Templates Store | Modern Web Templates",
  description:
    "Discover premium, responsive web templates built with React, Next.js, and Tailwind CSS. Perfect for SaaS, e-commerce, portfolios, and agencies. Created by Mohammed Ehab.",
  keywords:
    "web templates, React templates, Next.js templates, Tailwind CSS, premium templates, responsive design, SaaS templates, e-commerce templates, portfolio templates, agency templates, mhd store",
  authors: [{ name: "Mohammed Ehab" }],
  creator: "Mohammed Ehab",
  publisher: "Mohammed Ehab Templates",
  robots: "index, follow",
  openGraph: {
    title: "Mohammed Ehab - Premium Templates Store",
    description:
      "Premium, responsive web templates for modern businesses and creators",
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
    description:
      "Premium, responsive web templates for modern businesses and creators",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          id="gtm-loader"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
                            function loadGTM() {
                            (function(w,d,s,l,i){
                                w[l]=w[l]||[];
                                w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                                var f=d.getElementsByTagName(s)[0],
                                    j=d.createElement(s),
                                    dl=l!='dataLayer'?'&l='+l:'';
                                j.async=true;
                                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                                f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                            }

                            if ('requestIdleCallback' in window) {
                                requestIdleCallback(() => setTimeout(loadGTM, 2000));
                            } else {
                                setTimeout(loadGTM, 4000);
                            }
                        `,
          }}
        />
      </head>
      <body
        className={cn(
          "antialiased scroll-smooth bg-primary text-white",
          Roboto.className,
        )}
      >
        <Toaster />
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
            <div className="absolute inset-0 bg-primary" />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-linear-to-br from-primary via-dark to-primary opacity-90" />

            {/* Animated gradient orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-purple-500/20 via-pink-500/10 to-transparent rounded-full blur-3xl animate-float" />
            <div
              className="absolute top-1/3 right-0 w-80 h-80 bg-linear-to-bl from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-float"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute bottom-0 left-1/3 w-72 h-72 bg-linear-to-tr from-green-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl animate-float"
              style={{ animationDelay: "4s" }}
            />

            {/* Subtle radial gradient pattern */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 50% 50%, rgba(119, 255, 198, 0.05) 0%, transparent 50%)`,
              }}
            />
          </div>

          <Providers>{children}</Providers>
        </div>

        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Suspense fallback={null}>
          <GTMPageView />
        </Suspense>
        <BackToTop />
        <PersonSchema
          name="Mohammed Ehab - Premium Templates"
          url="https://mhd-store.vercel.app"
          image="https://mhd-store.vercel.app/assets/Icons/Logo.svg"
          sameAs={[
            "https://twitter.com/__M__O__H__",
            "https://github.com/MOHAMED-EHAB-DEV",
            "https://www.linkedin.com/in/1-mohammed",
          ]}
        />
      </body>
    </html>
  );
}

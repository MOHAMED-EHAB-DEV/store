import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Roboto, Parastoo } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import Providers from "./Providers";
import {
  PersonSchema,
  OrganizationSchema,
  WebSiteSchema,
} from "@/components/SEO/StructuredData";
// import { GoogleTagManager } from "@next/third-parties/google";

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
    "web templates, React templates, Next.js templates, Tailwind CSS, premium templates, responsive design, SaaS templates, e-commerce templates, portfolio templates, agency templates, mhd store, mhd templates store",
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
        url: "/og/home-desktop.png",
        width: 1920,
        height: 1008,
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
    images: ["/og/home-desktop.png"],
    creator: "@__M__O__H__",
  },
  icons: {
    icon: [
      { url: "/assets/Icons/Logo.svg", type: "image/svg+xml" },
      { url: "/assets/Icons/favicon.ico", sizes: "32x32" },
    ],
    shortcut: ["/assets/Icons/Logo.svg"],
    apple: [
      {
        url: "/assets/Icons/Logo.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: process.env.google_verification_code!,
  },
  alternates: {
    canonical: "https://mhd-store.vercel.app",
  },
  category: "technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={cn(
          "antialiased bg-primary text-white font-roboto",
          Roboto.variable,
          Parastoo.variable,
        )}
      >
        {/* <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID as string} /> */}
        <Toaster />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 bg-white text-black px-4 py-2 rounded-md z-[100] transition-all duration-200 shadow-2xl border border-black/10 font-bold"
        >
          Skip to main content
        </a>

        <div className="min-h-screen w-full relative">
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

        <OrganizationSchema />
        <WebSiteSchema />
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
        <Script id="chunk-error-reload" strategy="afterInteractive">{`
          (function () {
            var RELOAD_KEY = '__chunk_reload__';
            function isChunkError(err) {
              if (!err) return false;
              var msg = typeof err === 'string' ? err : (err.message || String(err));
              if (typeof msg !== 'string') return false;
              return (
                msg.indexOf('ChunkLoadError') !== -1 ||
                msg.indexOf('Loading chunk') !== -1 ||
                msg.indexOf("Cannot read properties of undefined (reading 'call')") !== -1 ||
                msg.indexOf('Unexpected token') !== -1 ||
                msg.indexOf('Failed to fetch dynamically imported module') !== -1 ||
                msg.indexOf('Failed to load module') !== -1 ||
                msg.indexOf('failed to fetch asset') !== -1 ||
                msg.indexOf('Turbopack') !== -1 ||
                msg.indexOf('turbopack') !== -1
              );
            }
            function triggerReload() {
              if (!sessionStorage.getItem(RELOAD_KEY)) {
                sessionStorage.setItem(RELOAD_KEY, '1');
                window.location.reload();
              } else {
                sessionStorage.removeItem(RELOAD_KEY);
              }
            }
            window.addEventListener('error', function (e) {
              var isScriptError = e && e.target && (e.target.tagName === 'SCRIPT' || e.target.nodeName === 'SCRIPT');
              if (isChunkError(e && e.message) || isScriptError) {
                triggerReload();
              }
            }, true);
            window.addEventListener('unhandledrejection', function (e) {
              var reason = e && e.reason;
              var msg = reason && (reason.message || String(reason));
              if (isChunkError(msg)) {
                e.preventDefault();
                triggerReload();
              }
            });
          })();
        `}</Script>
      </body>
    </html>
  );
}

import React from "react";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: React.ReactNode;
    }>) {
    return (
        <div className="relative px-4 md:px-0 z-10 flex flex-col min-h-screen">
            <Navbar/>

            <div id="main-content" className="flex-1 flex flex-col items-center gap-3 justify-start">
                {children}
            </div>

            <Footer/>
        </div>
    )
}

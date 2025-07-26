import React from "react";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import {authenticateUser} from "@/middleware/auth";

export default async function RootLayout({
                               children,
                           }: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await authenticateUser();
    return (
        <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar user={user && user}/>

            <div id="main-content" className="flex-1 flex flex-col items-center gap-3 justify-start">
                {children}
            </div>

            <Footer/>
        </div>
    )
}
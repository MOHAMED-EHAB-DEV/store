import { ReactLenis, useLenis } from 'lenis/react'
import { ReactNode } from 'react';
import NewFooter from "@/components/home/NewFooter";
import Navbar from "@/components/home/Navbar";

export default function RootLayout(
    {
        children,
    }: Readonly<{
        children: ReactNode;
    }>) {
    return (
        <>
            <ReactLenis root />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div id="main-content" className="flex-1 flex flex-col items-center gap-3 justify-start">
                    {children}
                </div>

                <NewFooter />
            </div>
        </>
    )
}

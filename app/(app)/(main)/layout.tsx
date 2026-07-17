import { ReactNode } from "react";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
// import LenisInitializer from "@/components/home/LenisInitializer";
import { ReactLenis } from "lenis/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ReactLenis root>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div
          id="main-content"
          className="flex-1 flex flex-col items-center gap-3 justify-start"
        >
          {children}
        </div>

        <Footer />
      </div>
    </ReactLenis>
  );
}

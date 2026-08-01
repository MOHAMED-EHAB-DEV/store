"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { isLowHardware } from "@/lib/utils";
import dynamic from "next/dynamic";

const ConciergeWidget = dynamic(() => import("@/components/ai/ConciergeWidget"), {
  ssr: false,
});

interface LenisDriverContextType {
  setCustomDriverActive: (active: boolean) => void;
}

const LenisDriverContext = createContext<LenisDriverContextType>({
  setCustomDriverActive: () => {},
});

export const useLenisDriver = () => useContext(LenisDriverContext);

export default function GlobalLenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const [mounted, setMounted] = useState(false);
  const [shouldEnable, setShouldEnable] = useState(true);
  const [customDriverActive, setCustomDriverActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShouldEnable(!isLowHardware());
  }, []);

  // Standard RAF loop active ONLY when GSAP initializer is NOT active
  useEffect(() => {
    if (!shouldEnable || !mounted || customDriverActive) return;

    let frameId: number;

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time);
      frameId = requestAnimationFrame(update);
    }

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [shouldEnable, mounted, customDriverActive]);

  if (mounted && !shouldEnable) {
    return <>{children}</>;
  }

  return (
    <LenisDriverContext.Provider value={{ setCustomDriverActive }}>
      <ReactLenis root options={{ autoRaf: false, syncTouch: false }} ref={lenisRef}>
        {children}
        {mounted && <ConciergeWidget />}
      </ReactLenis>
    </LenisDriverContext.Provider>
  );
}



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
  const customDriverRef = useRef(false);

  // Stable callback ref to mutate state without triggering React re-renders
  const setCustomDriverActive = useRef((active: boolean) => {
    customDriverRef.current = active;
  }).current;

  useEffect(() => {
    setMounted(true);
    setShouldEnable(!isLowHardware());
  }, []);

  // RAF loop checks mutable ref directly — 0 React re-renders
  useEffect(() => {
    if (!shouldEnable || !mounted) return;

    let frameId: number;

    function update(time: number) {
      if (!customDriverRef.current) {
        lenisRef.current?.lenis?.raf(time);
      }
      frameId = requestAnimationFrame(update);
    }

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [shouldEnable, mounted]);

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



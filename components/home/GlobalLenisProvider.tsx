"use client";

import { useEffect, useRef, useState } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { isLowHardware } from "@/lib/utils";

export default function GlobalLenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const [shouldEnable, setShouldEnable] = useState<boolean | null>(null);

  useEffect(() => {
    setShouldEnable(!isLowHardware());
  }, []);

  useEffect(() => {
    if (!shouldEnable) return;

    let frame: number;

    function update(time: number) {
      // If a GSAP page has mounted, it will set this flag to let GSAP's ticker drive Lenis
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).gsapTickerEnabled) {
        frame = requestAnimationFrame(update);
        return;
      }

      lenisRef.current?.lenis?.raf(time);
      frame = requestAnimationFrame(update);
    }

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [shouldEnable]);

  if (shouldEnable === false) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ autoRaf: false, syncTouch: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}


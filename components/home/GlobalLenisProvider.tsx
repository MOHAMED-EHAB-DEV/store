"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";

export default function GlobalLenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
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
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}

"use client";

import { useLayoutEffect, memo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);
}

const GSAPInitializer = memo(function GSAPInitializer() {
  const lenis = useLenis(ScrollTrigger.update);

  useLayoutEffect(() => {
    if (!lenis) return;

    // Tell GlobalLenisProvider to stop running its own RAF loop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gsapTickerEnabled = true;

    function update(time: number) {
      lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    
    // Force ScrollTrigger to recalculate positions now that the ticker is completely synced with GSAP
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gsapTickerEnabled = false;
    };
  }, [lenis]);

  return null;
});

export default GSAPInitializer;

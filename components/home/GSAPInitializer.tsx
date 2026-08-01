"use client";

import { useEffect, memo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { useLenisDriver } from "@/components/home/GlobalLenisProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);
  ScrollTrigger.config({ limitCallbacks: true });
}

const GSAPInitializer = memo(function GSAPInitializer() {
  const { setCustomDriverActive } = useLenisDriver();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // 1. Notify provider that GSAP is taking over RAF loop
    setCustomDriverActive(true);

    // 2. Direct ScrollTrigger update on Lenis scroll event
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    // 3. Drive Lenis RAF from GSAP ticker
    function update(time: number) {
      lenis?.raf(time * 1000);
    }

    gsap.ticker.add(update);

    // Keep safe lag smoothing to avoid catch-up thrashing on heavy main thread loads
    gsap.ticker.lagSmoothing(500, 33);

    // Defer ScrollTrigger refresh so it does not block initial render / mount frame
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(update);
      // Re-enable standard Lenis RAF when navigating away from GSAP page
      setCustomDriverActive(false);
    };
  }, [lenis, setCustomDriverActive]);

  return null;
});

export default GSAPInitializer;
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // Get number of decimal places in a number
  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes(".")) {
      const decimals = str.split(".")[1];
      if (parseInt(decimals) !== 0) {
        return decimals.length;
      }
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));
  const startVal = direction === "down" ? to : from;
  const endVal = direction === "down" ? from : to;

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = String(startVal);
    }
  }, [startVal]);

  useEffect(() => {
    if (!startWhen || !ref.current) return;

    const target = ref.current;
    const obj = { val: startVal };

    const updateText = (value: number) => {
      const hasDecimals = maxDecimals > 0;
      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      };

      const formattedNumber = Intl.NumberFormat("en-US", options).format(value);
      target.textContent = separator
        ? formattedNumber.replace(/,/g, separator)
        : formattedNumber;
    };

    const trigger = ScrollTrigger.create({
      trigger: target,
      start: "top 95%",
      once: true,
      onEnter: () => {
        if (typeof onStart === "function") {
          onStart();
        }

        gsap.to(obj, {
          val: endVal,
          duration: duration,
          delay: delay,
          ease: "power2.out", // Smooth power ease resembling a spring
          onUpdate: () => {
            updateText(obj.val);
          },
          onComplete: () => {
            if (typeof onEnd === "function") {
              onEnd();
            }
          },
        });
      },
    });

    return () => {
      trigger.kill();
      gsap.killTweensOf(obj);
    };
  }, [to, from, direction, delay, duration, startWhen, separator, onStart, onEnd, maxDecimals, startVal, endVal]);

  return <span className={className} ref={ref} />;
}

"use client";

import { useReportWebVitals } from "next/web-vitals";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Define the metric format
interface Metric {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
}

export default function WebVitalsReporter() {
  const pathname = usePathname();
  const queue = useRef<Metric[]>([]);
  const isSending = useRef(false);
  const visitorId = localStorage.getItem("_vid");

  // Send queued metrics to the server
  const flushQueue = () => {
    if (queue.current.length === 0 || isSending.current) return;

    isSending.current = true;
    const metricsToSend = [...queue.current];
    queue.current = []; // Clear queue

    const payload = JSON.stringify({
      path: pathname,
      metrics: metricsToSend,
      visitorId
    });

    // Use sendBeacon for best performance (doesn't block navigation)
    // Fallback to fetch if sendBeacon is unsupported
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/vitals", payload);
      isSending.current = false;
    } else {
      fetch("/api/analytics/vitals", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).finally(() => {
        isSending.current = false;
      });
    }
  };

  useReportWebVitals((metric) => {
    // Standardize rating to map to our schema enum
    let rating = "good";
    if (metric.rating === "needs-improvement") rating = "needs-improvement";
    if (metric.rating === "poor") rating = "poor";

    queue.current.push({
      name: metric.name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
    });

    // Schedule sending metrics when the browser is idle
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => flushQueue(), { timeout: 2000 });
    } else {
      setTimeout(flushQueue, 2000);
    }
  });

  // Flush remaining metrics on unmount (navigation)
  useEffect(() => {
    return () => {
      flushQueue();
    };
  }, [pathname]);

  return null;
}

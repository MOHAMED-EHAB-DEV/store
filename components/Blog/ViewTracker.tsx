"use client";

import { useEffect } from "react";

export default function ViewTracker({ blogId }: { blogId: string }) {
  useEffect(() => {
    // Only track view once per session per blog to avoid spamming
    const trackedKey = `blog_viewed_${blogId}`;
    if (sessionStorage.getItem(trackedKey)) return;

    const trackView = async () => {
      try {
        await fetch(`/api/blogs/${blogId}/view`, { method: "PATCH" });
        sessionStorage.setItem(trackedKey, "true");
      } catch (e) {
        console.error("Failed to track view");
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => trackView());
    } else {
      setTimeout(trackView, 2000);
    }
  }, [blogId]);

  return null;
}

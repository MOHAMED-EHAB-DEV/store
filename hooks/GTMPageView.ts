"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

export default function GTMPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      sendGTMEvent({
        event: "page_view",
        page_path: pathname,
        page_search: searchParams.toString(),
        page_location: window.location.href,
      });
    }
  }, [pathname, searchParams]);

  return null;
}
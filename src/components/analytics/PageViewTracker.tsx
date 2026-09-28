"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Meta and TikTok only count the first page load; report client-side navigations too. GA4 does this itself. */
export function PageViewTracker() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
    window.ttq?.page();
  }, [pathname]);
  return null;
}

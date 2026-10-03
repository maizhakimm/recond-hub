"use client";

import { useEffect, useRef, useState } from "react";
import { SOCIAL } from "@/lib/config";

/** "@farishafie313" from https://www.tiktok.com/@farishafie313?… */
export function tiktokHandle(url: string): string {
  return url.match(/tiktok\.com\/@([\w.-]+)/)?.[1] ?? "";
}

/**
 * TikTok's official creator embed: shows the account's latest videos and updates by itself.
 * The TikTok script (~heavy) only loads when the section scrolls into view, so it never slows the first paint.
 */
export function TikTokProfile() {
  const handle = tiktokHandle(SOCIAL.tiktok);
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    // Re-run TikTok's script each mount so client-side navigation re-renders the embed.
    const s = document.createElement("script");
    s.src = "https://www.tiktok.com/embed.js";
    s.async = true;
    document.body.appendChild(s);
    return () => s.remove();
  }, [visible]);

  if (!handle) return null;
  const profile = `https://www.tiktok.com/@${handle}`;
  return (
    <div ref={box} className="min-h-[420px]">
      {visible ? (
        <blockquote className="tiktok-embed" cite={profile} data-unique-id={handle} data-embed-type="creator" style={{ maxWidth: 780, minWidth: 288, margin: 0 }}>
          <section>
            <a target="_blank" rel="noopener" href={`${profile}?refer=creator_embed`}>
              @{handle}
            </a>
          </section>
        </blockquote>
      ) : (
        <a href={profile} target="_blank" rel="noopener" className="flex h-[420px] items-center justify-center rounded-md bg-night text-sm font-semibold text-white">
          Loading latest TikTok videos from @{handle}…
        </a>
      )}
    </div>
  );
}

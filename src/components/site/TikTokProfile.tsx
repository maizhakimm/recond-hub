"use client";

import { useEffect, useRef, useState } from "react";
import { SOCIAL } from "@/lib/config";

export function tiktokHandle(url: string): string {
  return url.match(/tiktok\.com\/@([\w.-]+)/)?.[1] ?? "";
}

/**
 * TikTok creator embed with a permanent profile fallback.
 * TikTok can block third-party embeds in some browsers/privacy modes, so the section
 * must remain useful even when embed.js is unavailable.
 */
export function TikTokProfile() {
  const handle = tiktokHandle(SOCIAL.tiktok);
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

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
      { rootMargin: "500px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.tiktok.com/embed.js"]');
    if (existing) {
      setEmbedLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://www.tiktok.com/embed.js";
    s.async = true;
    s.onload = () => setEmbedLoaded(true);
    s.onerror = () => setEmbedLoaded(false);
    document.body.appendChild(s);
  }, [visible]);

  if (!handle) return null;
  const profile = `https://www.tiktok.com/@${handle}`;

  return (
    <div ref={box} className="w-full max-w-[780px]">
      {visible && (
        <blockquote className="tiktok-embed" cite={profile} data-unique-id={handle} data-embed-type="creator" style={{ maxWidth: 780, minWidth: 288, margin: 0 }}>
          <section>
            <a target="_blank" rel="noopener noreferrer" href={`${profile}?refer=creator_embed`}>
              @{handle}
            </a>
          </section>
        </blockquote>
      )}

      <div className="mt-4 rounded-md border border-line bg-paper-2 p-5 text-center">
        <p className="font-bold">RecondHub on TikTok</p>
        <p className="mt-1 text-sm text-ink-2">
          {embedLoaded ? "Latest TikTok content is shown above when supported by your browser." : "TikTok preview may be blocked by your browser. Open our profile to watch the latest videos."}
        </p>
        <a href={profile} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
          Watch on TikTok · @{handle}
        </a>
      </div>
    </div>
  );
}

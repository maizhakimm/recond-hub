"use client";

import { SOCIAL } from "@/lib/config";
import { TIKTOK_VIDEOS } from "@/content/media";

export function tiktokHandle(url: string): string {
  return url.match(/tiktok\.com\/@([\w.-]+)/)?.[1] ?? "";
}

/**
 * Selected TikTok videos. Short share links are intentionally rendered as clickable
 * preview cards because TikTok's official player requires the resolved numeric video ID.
 * This keeps the homepage reliable while still surfacing the exact selected videos.
 */
export function TikTokProfile() {
  const handle = tiktokHandle(SOCIAL.tiktok);
  const profile = handle ? `https://www.tiktok.com/@${handle}` : SOCIAL.tiktok;

  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-3">
        {TIKTOK_VIDEOS.map((video, index) => (
          <a
            key={video.url}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-72 flex-col justify-between overflow-hidden rounded-md bg-night p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">TikTok</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-lg text-black transition group-hover:scale-105" aria-hidden>▶</span>
              </div>
              <p className="mt-10 text-2xl font-bold leading-tight">Video {index + 1}</p>
              <p className="mt-2 text-sm text-white/70">Selected from @{handle || "farishafie313"}</p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/15 pt-4 text-sm font-semibold">
              <span>{video.caption}</span>
              <span aria-hidden>↗</span>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-5 text-center">
        <a href={profile} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          View more on TikTok · @{handle || "farishafie313"}
        </a>
      </div>
    </div>
  );
}

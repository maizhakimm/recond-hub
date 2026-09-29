"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/ui/Icons";
import { SOCIAL } from "@/lib/config";
import type { TikTokVideo } from "@/content/media";

/** Click-to-load facade: no TikTok JavaScript until the visitor asks for it (keeps LCP fast). */
export function TikTokEmbed({ video }: { video: TikTokVideo }) {
  const [on, setOn] = useState(false);
  if (on && video.id)
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${video.id}`}
        title={video.caption}
        className="aspect-[9/16] w-full rounded-md border-0 bg-night"
        allow="encrypted-media; fullscreen"
        loading="lazy"
      />
    );
  const inner = (
    <>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-paper/90 text-ink">
        <PlayIcon />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4 text-left text-sm font-medium">{video.caption}</span>
    </>
  );
  const cls = "relative flex aspect-[9/16] w-full items-center justify-center rounded-md bg-gradient-to-b from-night-3 to-night text-paper";
  return video.id ? (
    <button type="button" onClick={() => setOn(true)} className={cls} aria-label={`Play TikTok: ${video.caption}`}>
      {inner}
    </button>
  ) : (
    <a href={SOCIAL.tiktok} target="_blank" rel="noopener" className={cls} aria-label={`Watch on TikTok: ${video.caption}`}>
      {inner}
    </a>
  );
}

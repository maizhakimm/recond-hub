"use client";

import { SOCIAL } from "@/lib/config";
import { TIKTOK_VIDEOS } from "@/content/media";

export function tiktokHandle(url: string): string {
  return url.match(/tiktok\.com\/@([\w.-]+)/)?.[1] ?? "";
}

/** Selected TikTok videos rendered with TikTok's direct official player iframe. */
export function TikTokProfile() {
  const handle = tiktokHandle(SOCIAL.tiktok);
  const profile = handle ? `https://www.tiktok.com/@${handle}` : SOCIAL.tiktok;

  return (
    <div className="w-full">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {TIKTOK_VIDEOS.map((video) => (
          <div key={video.id} className="w-[325px] shrink-0 snap-start sm:w-[350px] lg:w-auto">
            <div className="overflow-hidden rounded-xl bg-black shadow-sm">
              <iframe
                src={`https://www.tiktok.com/player/v1/${video.id}?&music_info=1&description=1&autoplay=0&loop=0`}
                title={`TikTok video ${video.id}`}
                allow="fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="block aspect-[9/16] w-full border-0"
              />
            </div>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold underline underline-offset-4"
            >
              Open on TikTok ↗
            </a>
          </div>
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

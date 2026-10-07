"use client";

import Script from "next/script";
import { SOCIAL } from "@/lib/config";
import { TIKTOK_VIDEOS } from "@/content/media";

export function tiktokHandle(url: string): string {
  return url.match(/tiktok\.com\/@([\w.-]+)/)?.[1] ?? "";
}

/** Selected TikTok videos rendered with TikTok's official video embed. */
export function TikTokProfile() {
  const handle = tiktokHandle(SOCIAL.tiktok);
  const profile = handle ? `https://www.tiktok.com/@${handle}` : SOCIAL.tiktok;

  return (
    <div className="w-full">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {TIKTOK_VIDEOS.map((video) => (
          <div key={video.id} className="w-[325px] shrink-0 snap-start sm:w-[350px] lg:w-auto">
            <blockquote
              className="tiktok-embed"
              cite={video.url}
              data-video-id={video.id}
              style={{ maxWidth: 605, minWidth: 288, margin: 0 }}
            >
              <section>
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  {video.caption}
                </a>
              </section>
            </blockquote>
          </div>
        ))}
      </div>

      <Script src="https://www.tiktok.com/embed.js" strategy="lazyOnload" />

      <div className="mt-5 text-center">
        <a href={profile} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          View more on TikTok · @{handle || "farishafie313"}
        </a>
      </div>
    </div>
  );
}

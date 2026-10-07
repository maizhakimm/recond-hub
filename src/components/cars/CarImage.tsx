"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * Car photos normally go through next/image. If a remote/Drive image cannot load,
 * show a clean local fallback instead of leaving a broken hero/card.
 */
export function CarImage({ src, alt, ...rest }: Omit<ImageProps, "src"> & { src?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-paper-2 p-6 text-center text-sm text-muted" role="img" aria-label={alt}>
        <div>
          <p className="font-semibold text-ink-2">RecondHub</p>
          <p className="mt-1">Vehicle photo coming soon</p>
        </div>
      </div>
    );
  }

  const img = (
    <Image
      src={src}
      alt={alt}
      unoptimized={src.endsWith(".svg")}
      onError={() => setFailed(true)}
      {...rest}
    />
  );

  if (!src.startsWith("/photos/")) return img;
  return (
    <>
      {img}
      <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">Demo photo</span>
    </>
  );
}

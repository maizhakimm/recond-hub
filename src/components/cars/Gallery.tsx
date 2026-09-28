"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CarImage } from "./CarImage";
import { ChevronIcon, CloseIcon } from "@/components/ui/Icons";

/** Swipeable (CSS scroll-snap) gallery with thumbnails and a keyboard-navigable fullscreen lightbox. */
export function Gallery({ photos, alt, sold = false }: { photos: string[]; alt: string; sold?: boolean }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const list = photos.length ? photos : [""];

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const step = (delta: number) => setIndex((i) => (i + delta + list.length) % list.length);

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-paper-2">
        <div ref={track} className="no-scrollbar flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto" aria-roledescription="carousel" aria-label="Car photos">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className="relative h-full w-full shrink-0 snap-center"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              aria-label={`Open photo ${i + 1} of ${list.length} fullscreen`}
            >
              <CarImage
                src={src}
                alt={`${alt}${i ? ` photo ${i + 1}` : ""}`}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className={`object-cover ${sold ? "grayscale" : ""}`}
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
              />
            </button>
          ))}
        </div>
        {list.length > 1 && (
          <>
            <button type="button" onClick={() => goTo(Math.max(0, index - 1))} className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow sm:grid" aria-label="Previous photo">
              <ChevronIcon className="h-5 w-5 rotate-180" />
            </button>
            <button type="button" onClick={() => goTo(Math.min(list.length - 1, index + 1))} className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow sm:grid" aria-label="Next photo">
              <ChevronIcon className="h-5 w-5" />
            </button>
            <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-2 py-0.5 text-xs text-paper tnum" aria-live="polite">
              {index + 1} / {list.length}
            </span>
          </>
        )}
      </div>
      {list.length > 1 && (
        <ul className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {list.map((src, i) => (
            <li key={`t-${src}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(i)}
                className={`relative block h-16 w-20 overflow-hidden rounded-md border-2 ${i === index ? "border-gold" : "border-transparent"}`}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
              >
                <CarImage src={src} alt="" fill sizes="80px" className="object-cover" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-night p-0 text-paper"
        aria-label="Photo viewer"
      >
        {open && (
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="relative h-full w-full">
              <CarImage src={list[index]} alt={`${alt} photo ${index + 1}`} fill sizes="100vw" className="object-contain" />
            </div>
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-black/60" aria-label="Close photo viewer">
              <CloseIcon />
            </button>
            {list.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/60" aria-label="Previous photo">
                  <ChevronIcon className="h-6 w-6 rotate-180" />
                </button>
                <button type="button" onClick={() => step(1)} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-black/60" aria-label="Next photo">
                  <ChevronIcon className="h-6 w-6" />
                </button>
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm tnum">
                  {index + 1} / {list.length}
                </p>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}

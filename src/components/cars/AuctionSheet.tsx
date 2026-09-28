"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { DocIcon } from "@/components/ui/Icons";
import { CarImage } from "./CarImage";

export function AuctionSheet({ url, code }: { url: string; code: string }) {
  const [open, setOpen] = useState(false);
  if (!url) return <p className="text-sm text-muted">Auction sheet available on request at the showroom.</p>;
  const isPdf = /\.pdf($|\?)/i.test(url);
  if (isPdf)
    return (
      <a href={url} target="_blank" rel="noopener" className="btn btn-outline">
        <DocIcon /> View auction sheet (PDF)
      </a>
    );
  return (
    <>
      <button type="button" className="btn btn-outline" onClick={() => setOpen(true)}>
        <DocIcon /> View auction sheet
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Auction sheet · #${code}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-white">
          <CarImage src={url} alt={`Japanese auction sheet for car #${code}`} fill sizes="(min-width: 640px) 32rem, 100vw" className="object-contain" />
        </div>
        <p className="mt-3 text-sm text-ink-2">
          Not sure how to read it? See our guide:{" "}
          <Link className="font-medium text-gold-text underline" href="/guide/how-to-read-japanese-auction-sheet">
            How to read a Japanese auction sheet
          </Link>
          .
        </p>
      </Modal>
    </>
  );
}

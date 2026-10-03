"use client";

import Link from "next/link";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";

/** Friendly fallback if a page fails to render (e.g. the sheet is briefly unreachable on a cold start). */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container-page py-20 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-2 text-4xl">We couldn&rsquo;t load this page</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-2">Please try again. If it keeps happening, WhatsApp us and we&rsquo;ll help you straight away.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => retry()} className="btn btn-primary">
          Try again
        </button>
        <Link href="/cars" className="btn btn-outline">
          Browse cars
        </Link>
        <WhatsAppButton label="WhatsApp us" message="Hi, the website showed an error. Can you help?" />
      </div>
      {error.digest && <p className="mt-6 text-xs text-muted">Ref: {error.digest}</p>}
    </div>
  );
}

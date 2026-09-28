import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { TikTokEmbed } from "@/components/site/TikTokEmbed";
import { DocIcon, ShieldIcon, WrenchIcon } from "@/components/ui/Icons";
import { FINANCING_PARTNERS, REVIEWS, TIKTOK_VIDEOS } from "@/content/media";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  title: "Why Buy Recond With Us · Inspection, Auction Sheet & Warranty",
  description: `How ${BRAND} checks every recond car: auction sheet verification, multi-point inspection, warranty and bank financing.`,
  alternates: { canonical: "/why-us" },
};

const STEPS = [
  { t: "Auction sheet check", d: "Before we bid, our team reads the original Japanese auction sheet: grade, interior score, mileage and the inspector's diagram of every mark." },
  { t: "Arrival inspection", d: "When the car lands, we compare it against the sheet and run a multi-point check of engine, gearbox, suspension, electrics and body." },
  { t: "Mileage verification", d: "Odometer readings are cross-checked against the auction record and export certificate." },
  { t: "Reconditioning", d: "Service, fluids, detailing and any repairs are done before the car is listed." },
  { t: "Puspakom & JPJ", d: "We handle inspection, registration, insurance and road tax, so you drive away legal." },
];

export default function WhyUsPage() {
  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Why us", href: "/why-us" },
        ]}
      />
      <h1 className="max-w-3xl text-4xl sm:text-5xl">Why buy your recond car with {BRAND}</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-2">A recond car is only as good as the checks behind it. Here is exactly what we do.</p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: DocIcon, t: "Auction sheet verified", d: "Every car comes with its original auction sheet. We show it on the listing so you can check it yourself." },
          { icon: WrenchIcon, t: "Inspected at HQ", d: "Multi-point inspection and reconditioning before the car reaches the showroom." },
          { icon: ShieldIcon, t: "Warranty included", d: "Engine and gearbox warranty on every car. Ask your agent for the terms on a specific car." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="rounded-xl border border-line bg-card p-5">
            <Icon className="h-8 w-8 text-gold" />
            <h2 className="mt-3 text-2xl">{t}</h2>
            <p className="mt-1 text-ink-2">{d}</p>
          </div>
        ))}
      </div>

      <section className="mt-14 max-w-3xl" aria-labelledby="process">
        <h2 id="process" className="text-3xl">
          Our inspection process
        </h2>
        <ol className="mt-5 space-y-5">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-semibold text-champagne tnum">{i + 1}</span>
              <div>
                <h3 className="font-sans text-lg font-semibold tracking-normal">{s.t}</h3>
                <p className="text-ink-2">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6">
          <Link href="/guide/how-to-read-japanese-auction-sheet" className="font-medium text-gold-text underline">
            Learn to read an auction sheet yourself
          </Link>
        </p>
      </section>

      <section className="mt-14 max-w-3xl" aria-labelledby="finance">
        <h2 id="finance" className="text-3xl">
          Financing
        </h2>
        <p className="mt-2 text-ink-2">
          We submit your application to several banks at once and handle the paperwork, so you get the best rate you qualify for.
          {FINANCING_PARTNERS.length ? ` Our partners include ${FINANCING_PARTNERS.join(", ")}.` : ""}
        </p>
        <Link href="/loan-calculator" className="btn btn-outline mt-4">
          Try the loan calculator
        </Link>
      </section>

      {REVIEWS.length > 0 && (
        <section className="mt-14" aria-labelledby="reviews">
          <h2 id="reviews" className="text-3xl">
            What customers say
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <li key={r.name + r.car} className="rounded-xl border border-line bg-card p-5">
                <p className="text-ink-2">&ldquo;{r.text}&rdquo;</p>
                <p className="mt-3 text-sm font-semibold">
                  {r.name} · {r.car}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-14" aria-labelledby="tiktok">
        <h2 id="tiktok" className="text-3xl">
          See it on TikTok
        </h2>
        <ul className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
          {TIKTOK_VIDEOS.map((v, i) => (
            <li key={i} className="w-56 shrink-0 sm:w-auto">
              <TikTokEmbed video={v} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

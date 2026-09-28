import type { Metadata } from "next";
import Image from "next/image";
import { PrivateSourcingForm } from "@/components/private/PrivateSourcingForm";
import { PRIVATE_DELIVERIES, PRIVATE_HERO_IMAGE, PRIVATE_HERO_VIDEO } from "@/content/media";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  title: "Private Sourcing · Ferrari, Lamborghini, McLaren & Bugatti in Malaysia",
  description: `${BRAND} Private Sourcing: discreet custom import of exotic and rare cars into Malaysia. Ferrari, Lamborghini, McLaren, Bugatti. Price on request.`,
  alternates: { canonical: "/private" },
};

export default function PrivatePage() {
  return (
    <>
      <section className="relative flex min-h-dvh items-end overflow-hidden">
        {PRIVATE_HERO_VIDEO ? (
          <video className="absolute inset-0 h-full w-full object-cover" src={PRIVATE_HERO_VIDEO} poster={PRIVATE_HERO_IMAGE} autoPlay muted loop playsInline aria-hidden />
        ) : (
          <Image src={PRIVATE_HERO_IMAGE} alt="" fill priority sizes="100vw" className="object-cover opacity-80" unoptimized={PRIVATE_HERO_IMAGE.endsWith(".svg")} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-night/20" />
        <div className="container-page relative pb-20 pt-32">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">Private Sourcing</p>
          <h1 className="mt-4 max-w-3xl text-5xl leading-[1.02] text-[#f7f1e3] sm:text-7xl">The car you want. Found, imported, delivered.</h1>
          <p className="mt-5 max-w-md text-lg text-[#c9bfab]">Ferrari · Lamborghini · McLaren · Bugatti</p>
          <a href="#request" className="btn mt-8 border border-champagne px-6 text-champagne hover:bg-champagne hover:text-night">
            Begin a request
          </a>
        </div>
      </section>

      <section className="container-page grid gap-10 py-24 md:grid-cols-3" aria-label="How it works">
        {[
          ["01", "Specification", "Tell us the car, colour and options. We search dealer networks and private collections worldwide."],
          ["02", "Import", "We handle AP, duties, shipping, JPJ and Puspakom. You get one point of contact: the owner."],
          ["03", "Handover", "Delivered to your door, detailed and registered."],
        ].map(([n, t, d]) => (
          <div key={n}>
            <p className="font-serif text-5xl text-champagne">{n}</p>
            <h2 className="mt-2 text-3xl text-[#f7f1e3]">{t}</h2>
            <p className="mt-2 text-[#b9ae98]">{d}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-[#2a261f] bg-night-2 py-24" aria-labelledby="delivered">
        <div className="container-page">
          <h2 id="delivered" className="text-4xl text-[#f7f1e3] sm:text-5xl">
            Recently delivered
          </h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {PRIVATE_DELIVERIES.map((d) => (
              <li key={d.title}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={d.image} alt={d.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" unoptimized={d.image.endsWith(".svg")} />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-4">
                  <div>
                    <p className="font-serif text-2xl text-[#f7f1e3]">{d.title}</p>
                    <p className="text-sm text-[#8c826f]">{d.note}</p>
                  </div>
                  <p className="shrink-0 text-sm italic text-champagne">Price on request</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="request" className="container-page scroll-mt-8 py-24" aria-labelledby="req">
        <div className="mx-auto max-w-2xl">
          <h2 id="req" className="text-4xl text-[#f7f1e3] sm:text-5xl">
            Private request
          </h2>
          <p className="mt-3 text-[#b9ae98]">Your request goes directly to our owner, never to the general sales team.</p>
          <PrivateSourcingForm />
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { AgentCard, ShowroomCard } from "@/components/site/ContactCards";
import { CheckIcon } from "@/components/ui/Icons";
import { BRAND, SITE_URL } from "@/lib/config";
import { agentsInState, defaultShowroom, hqAgents, relatedCars, showroomFor, toSummary } from "@/lib/data/queries";
import type { Car, SiteData } from "@/lib/data/types";
import { carAlt, formatKm, formatRM } from "@/lib/format";
import type { ArticleMeta } from "@/lib/guide";
import { fromMonthly } from "@/lib/loan";
import { pickRoundRobin } from "@/lib/leads/routing";
import { AuctionSheet } from "./AuctionSheet";
import { GradeBadge, StatusBadge, TrustRow } from "./Badges";
import { CarGrid } from "./CarCard";
import { CarCTAs } from "./CarCTAs";
import { Gallery } from "./Gallery";
import { LoanCalculator } from "./LoanCalculator";
import { TrackView } from "./TrackView";

export function absoluteUrl(u: string): string {
  return u.startsWith("/") ? `${SITE_URL}${u}` : u;
}

export function CarDetail({ data, car, articles }: { data: SiteData; car: Car; articles: ArticleMeta[] }) {
  const sold = car.status === "Sold";
  const showroom = showroomFor(data, car);
  const fallbackShowroom = defaultShowroom(data, car);
  const agent = pickRoundRobin(agentsInState(data, car.stateSlug)) ?? pickRoundRobin(hqAgents(data));
  const related = relatedCars(data, car, sold ? 8 : 4).map((c) => toSummary(c, data.settings));
  const monthly = fromMonthly(car.price_rm, data.settings);
  const summary = { year: car.year_manufactured, make: car.make, model: car.model, colour: car.colour };
  const name = `${car.year_manufactured} ${car.title}`;

  const specs: [string, string | undefined][] = [
    ["Stock code", `#${car.code}`],
    ["Make", car.make],
    ["Model", car.model],
    ["Variant", car.variant],
    ["Year manufactured", String(car.year_manufactured)],
    ["Year registered", car.year_registered ? String(car.year_registered) : "Unregistered (recond)"],
    ["Body type", car.body_type],
    ["Mileage", formatKm(car.mileage_km)],
    ["Auction grade", car.grade],
    ["Engine", car.engine_cc ? `${car.engine_cc.toLocaleString("en-MY")} cc` : undefined],
    ["Transmission", car.transmission],
    ["Fuel", car.fuel],
    ["Colour", car.colour],
    ["Location", showroom ? `${showroom.name}, ${car.stateName}` : car.stateName],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name,
    sku: car.code,
    url: `${SITE_URL}/cars/${car.slug}`,
    image: car.photos.map(absoluteUrl),
    description: car.description || `${name} recond for sale in ${car.stateName}.`,
    brand: { "@type": "Brand", name: car.make },
    model: car.model,
    vehicleConfiguration: car.variant || undefined,
    vehicleModelDate: String(car.year_manufactured),
    productionDate: String(car.year_manufactured),
    dateVehicleFirstRegistered: car.year_registered ? String(car.year_registered) : undefined,
    bodyType: car.body_type,
    color: car.colour || undefined,
    fuelType: car.fuel || undefined,
    vehicleTransmission: car.transmission || undefined,
    itemCondition: "https://schema.org/UsedCondition",
    mileageFromOdometer: car.mileage_km !== undefined ? { "@type": "QuantitativeValue", value: car.mileage_km, unitCode: "KMT" } : undefined,
    vehicleEngine: car.engine_cc ? { "@type": "EngineSpecification", engineDisplacement: { "@type": "QuantitativeValue", value: car.engine_cc, unitCode: "CMQ" } } : undefined,
    offers: {
      "@type": "Offer",
      price: car.price_rm,
      priceCurrency: "MYR",
      availability: sold ? "https://schema.org/SoldOut" : car.status === "Reserved" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      url: `${SITE_URL}/cars/${car.slug}`,
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "AutoDealer",
        name: showroom?.name ?? BRAND,
        address: showroom ? { "@type": "PostalAddress", streetAddress: showroom.address, addressLocality: showroom.city, addressRegion: showroom.stateName, addressCountry: "MY" } : undefined,
      },
    },
  };

  return (
    <div className="container-page py-6 pb-28 md:pb-6">
      {!sold && <TrackView params={{ car_code: car.code, state: car.stateSlug, agent: agent?.agent_id }} />}
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Cars", href: "/cars" },
          { name: car.make, href: `/cars/${car.makeSlug}` },
          { name: car.model, href: `/cars/${car.makeSlug}/${car.modelSlug}` },
          { name: `#${car.code}`, href: `/cars/${car.slug}` },
        ]}
      />

      {sold && (
        <div role="status" className="mb-6 rounded-xl bg-ink p-5 text-paper">
          <p className="text-2xl">This {car.make} {car.model} has been sold.</p>
          <p className="mt-1 text-[#c5cad3]">Good news: we have similar cars below, and we can source another one for you.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/cars/${car.makeSlug}/${car.modelSlug}`} className="btn btn-gold">
              See all {car.model} in stock
            </Link>
            <Link href={`/find-me-a-car?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(car.model)}`} className="btn border border-paper/40 text-paper hover:bg-paper/10">
              Find me one like this
            </Link>
          </div>
        </div>
      )}

      {sold && related.length > 0 && (
        <section className="mb-10" aria-labelledby="alts">
          <h2 id="alts" className="mb-4 text-3xl">
            Available alternatives
          </h2>
          <CarGrid cars={related} />
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-8">
          <Gallery photos={car.photos} alt={carAlt(summary)} sold={sold} />

          {/* Title block for phones (desktop shows it in the sidebar) */}
          <div className="lg:hidden">
            <TitleBlock car={car} monthly={monthly} />
          </div>

          {car.highlights.length > 0 && (
            <section aria-labelledby="hl">
              <h2 id="hl" className="mb-3 text-2xl">
                Highlights
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {car.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {car.description && (
            <section aria-labelledby="desc">
              <h2 id="desc" className="mb-2 text-2xl">
                About this car
              </h2>
              <p className="whitespace-pre-line text-ink-2">{car.description}</p>
            </section>
          )}

          <section aria-labelledby="specs">
            <h2 id="specs" className="mb-3 text-2xl">
              Specifications
            </h2>
            <table className="w-full overflow-hidden rounded-xl border border-line bg-card text-sm">
              <tbody>
                {specs
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <tr key={k} className="border-b border-line last:border-0">
                      <th scope="row" className="w-1/2 px-4 py-2.5 text-left font-medium text-muted">
                        {k}
                      </th>
                      <td className="px-4 py-2.5 tnum">{v}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="auction" className="rounded-xl border border-line bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 id="auction" className="text-2xl">
                  Auction grade & sheet
                </h2>
                <p className="mt-1 text-sm text-ink-2">Every car is sold with its original Japanese auction sheet, verified by our team before purchase.</p>
              </div>
              <GradeBadge grade={car.grade} large />
            </div>
            <div className="mt-3">
              <AuctionSheet url={car.auction_sheet_url} code={car.code} />
            </div>
          </section>

          {!sold && (
            <section id="loan" aria-labelledby="loan-h" className="scroll-mt-20">
              <h2 id="loan-h" className="mb-3 text-2xl">
                Loan calculator
              </h2>
              <LoanCalculator price={car.price_rm} car={{ code: car.code, label: name, stateSlug: car.stateSlug }} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="Price and contact">
          <div className="hidden lg:block">
            <TitleBlock car={car} monthly={monthly} />
          </div>
          {!sold && (
            <CarCTAs
              car={{ code: car.code, make: car.make, model: car.model, variant: car.variant, year: car.year_manufactured, stateSlug: car.stateSlug }}
              showrooms={data.showrooms.map((s) => ({ id: s.showroom_id, name: s.name, stateSlug: s.stateSlug, hours: s.opening_hours }))}
              defaultShowroomId={fallbackShowroom?.showroom_id}
            />
          )}
          {showroom && <ShowroomCard s={showroom} carCode={car.code} />}
          {agent && !sold && <AgentCard agent={agent} carCode={car.code} label={agent.stateSlug === "hq" ? "Your sales advisor" : `Your agent in ${car.stateName}`} />}
        </aside>
      </div>

      {!sold && related.length > 0 && (
        <section className="mt-14" aria-labelledby="related">
          <h2 id="related" className="mb-4 text-3xl">
            You may also like
          </h2>
          <CarGrid cars={related} />
        </section>
      )}

      {articles.length > 0 && (
        <section className="mt-14" aria-labelledby="reading">
          <h2 id="reading" className="mb-4 text-3xl">
            Before you buy
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {articles.map((a) => (
              <li key={a.slug}>
                <Link href={`/guide/${a.slug}`} className="block h-full rounded-xl border border-line bg-card p-5 hover:border-gold">
                  <p className="text-xl font-semibold leading-tight">{a.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-2">{a.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TitleBlock({ car, monthly }: { car: Car; monthly: number }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge status={car.status} />
        <GradeBadge grade={car.grade} />
        <span className="text-xs text-muted tnum">#{car.code}</span>
      </div>
      <h1 className="text-3xl leading-tight sm:text-4xl">
        {car.year_manufactured} {car.make} {car.model}
        {car.variant && <span className="mt-1 block text-lg font-semibold tracking-normal text-muted">{car.variant}</span>}
      </h1>
      <p className="mt-3 text-3xl font-bold tnum">{car.status === "Sold" ? "Sold" : formatRM(car.price_rm)}</p>
      {car.status !== "Sold" && (
        <p className="text-sm text-muted tnum">
          from {formatRM(monthly)}/month · <a href="#loan" className="underline">calculate</a>
        </p>
      )}
      <p className="mt-2 text-sm text-ink-2 tnum">
        {formatKm(car.mileage_km)} · {car.transmission || "Auto"} · {car.stateName}
      </p>
      <div className="mt-3">
        <TrustRow />
      </div>
    </div>
  );
}

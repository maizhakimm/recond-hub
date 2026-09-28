import Image from "next/image";
import Link from "next/link";
import { CarGrid } from "@/components/cars/CarCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { TikTokEmbed } from "@/components/site/TikTokEmbed";
import { DocIcon, SearchIcon, ShieldIcon, StoreIcon, UsersIcon, WrenchIcon } from "@/components/ui/Icons";
import { DELIVERIES, TIKTOK_VIDEOS } from "@/content/media";
import { BRAND, BRAND_TAGLINE, SITE_URL, SOCIAL } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listedStock, makeFacets, MONTHLY_BANDS, toSummary } from "@/lib/data/queries";
import { BODY_TYPES } from "@/lib/data/schema";
import { getArticles, CATEGORIES } from "@/lib/guide";
import { STATES } from "@/lib/states";

export const revalidate = 300;

const TRUST = [
  { icon: DocIcon, title: "Auction sheet verified", text: "Original Japanese sheet checked before we buy." },
  { icon: WrenchIcon, title: "Full inspection", text: "Multi-point check at our HQ workshop." },
  { icon: ShieldIcon, title: "Warranty included", text: "Engine & gearbox cover on every car." },
  { icon: StoreIcon, title: "10+ showrooms", text: "View and test drive near you." },
  { icon: UsersIcon, title: "Agents nationwide", text: "A local agent in your state." },
];

const BUDGET_OPTIONS = [100, 150, 200, 250, 300, 500];

export default async function HomePage() {
  const [data, articles] = await Promise.all([getSiteData(), getArticles()]);
  const listed = listedStock(data).filter((c) => c.status !== "Sold");
  const featured = (listed.filter((c) => c.featured).length >= 4 ? listed.filter((c) => c.featured) : listed).slice(0, 8);
  const makes = makeFacets(listed);
  const stateSlugs = new Set(listed.map((c) => c.stateSlug));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BRAND,
          url: SITE_URL,
          potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/cars?q={search_term_string}`, "query-input": "required name=search_term_string" },
        }}
      />
      {/* Hero */}
      <section className="border-b border-line bg-gradient-to-b from-paper-2 to-paper">
        <div className="container-page py-10 sm:py-16">
          <p className="eyebrow">{BRAND_TAGLINE} · Kereta recond Malaysia</p>
          <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">Find your recond car. Book a viewing today.</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">
            {listed.length}+ auction-sheet verified recond cars from Japan and the UK, at {data.showrooms.length > 9 ? `${data.showrooms.length}` : "10+"} showrooms with agents across Malaysia.
          </p>

          <form action="/cars" method="get" role="search" className="mt-6 max-w-3xl rounded-2xl border border-line bg-card p-3 shadow-sm sm:p-4">
            <label className="relative block">
              <span className="sr-only">Search cars</span>
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" />
              <input
                name="q"
                type="search"
                enterKeyHint="search"
                placeholder="Search Alphard, Harrier, BMW…"
                className="field h-14 pl-12 text-lg"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <label>
                <span className="sr-only">Budget</span>
                <select name="pmax" className="field" defaultValue="">
                  <option value="">Any budget</option>
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b} value={b * 1000}>
                      Under RM{b}k
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Body type</span>
                <select name="body" className="field" defaultValue="">
                  <option value="">Any body type</option>
                  {BODY_TYPES.map((b) => (
                    <option key={b} value={b.toLowerCase()}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">State</span>
                <select name="state" className="field" defaultValue="">
                  <option value="">All states</option>
                  {STATES.filter((s) => stateSlugs.has(s.slug)).map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-primary col-span-2 sm:col-span-1">
                Search cars
              </button>
            </div>
          </form>
          <ul className="mt-4 flex flex-wrap gap-2 text-sm">
            {["Alphard", "Vellfire", "Harrier", "Civic Type R", "Porsche"].map((q) => (
              <li key={q}>
                <Link href={`/cars?q=${encodeURIComponent(q)}`} className="chip">
                  {q}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why buy with us" className="border-b border-line bg-card">
        <ul className="container-page no-scrollbar flex gap-6 overflow-x-auto py-5 lg:grid lg:grid-cols-5">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex min-w-56 items-start gap-3">
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured */}
      <section className="container-page py-12" aria-labelledby="featured">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="featured" className="text-4xl">
            Featured stock
          </h2>
          <Link href="/cars" className="font-medium text-gold-text underline">
            See all {listed.length} cars
          </Link>
        </div>
        <CarGrid cars={featured.map((c) => toSummary(c, data.settings))} />
      </section>

      {/* Browse */}
      <section className="border-y border-line bg-paper-2 py-12">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div>
            <h2 className="mb-4 text-3xl">Browse by make</h2>
            <ul className="flex flex-wrap gap-2">
              {makes.map((m) => (
                <li key={m.slug}>
                  <Link href={`/cars/${m.slug}`} className="chip">
                    {m.make} <span className="text-muted tnum">{m.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-3xl">Browse by body type</h2>
            <ul className="grid grid-cols-3 gap-2">
              {BODY_TYPES.map((b) => (
                <li key={b}>
                  <Link href={`/cars/body/${b.toLowerCase()}`} className="flex min-h-16 flex-col items-center justify-center rounded-lg border border-line bg-card p-2 text-sm font-medium hover:border-gold">
                    <Image src={`/sample/${b.toLowerCase()}.svg`} alt="" width={64} height={48} unoptimized className="h-8 w-auto" />
                    {b}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-3xl">Browse by monthly budget</h2>
            <ul className="grid gap-2">
              {MONTHLY_BANDS.map((b) => {
                const qs = new URLSearchParams();
                if ("min" in b) qs.set("mmin", String(b.min));
                if ("max" in b) qs.set("mmax", String(b.max));
                return (
                  <li key={b.label}>
                    <Link href={`/cars?${qs}`} className="flex min-h-11 items-center justify-between rounded-lg border border-line bg-card px-4 font-medium hover:border-gold">
                      <span className="tnum">{b.label}/month</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href="/loan-calculator" className="mt-3 inline-block text-sm font-medium text-gold-text underline">
              Work out what you can afford
            </Link>
          </div>
        </div>
      </section>

      {/* Guide */}
      <section className="container-page py-12" aria-labelledby="guide">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Recond Guide</p>
            <h2 id="guide" className="text-4xl">
              Know before you buy
            </h2>
          </div>
          <Link href="/guide" className="font-medium text-gold-text underline">
            All guides
          </Link>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {articles.slice(0, 3).map((a) => (
            <li key={a.slug}>
              <Link href={`/guide/${a.slug}`} className="block h-full rounded-xl border border-line bg-card p-5 hover:border-gold">
                <p className="eyebrow">{CATEGORIES.find((c) => c.slug === a.category)?.name}</p>
                <p className="mt-2 font-serif text-2xl font-semibold leading-tight">{a.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-ink-2">{a.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Deliveries + TikTok */}
      <section className="border-y border-line bg-card py-12" aria-labelledby="happy">
        <div className="container-page">
          <h2 id="happy" className="text-4xl">
            Delivered to happy owners
          </h2>
          <ul className="no-scrollbar -mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2">
            {DELIVERIES.map((d, i) => (
              <li key={i} className="w-64 shrink-0">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-paper-2">
                  <Image src={d.image} alt={`Customer delivery: ${d.caption}`} fill sizes="16rem" className="object-cover" unoptimized={d.image.endsWith(".svg")} />
                </div>
                <p className="mt-2 text-sm text-ink-2">{d.caption}</p>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-end justify-between gap-4">
            <h3 className="text-3xl">On TikTok</h3>
            <a href={SOCIAL.tiktok} target="_blank" rel="noopener" className="font-medium text-gold-text underline">
              Follow {BRAND_TAGLINE}
            </a>
          </div>
          <ul className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
            {TIKTOK_VIDEOS.map((v, i) => (
              <li key={i} className="w-56 shrink-0 sm:w-auto">
                <TikTokEmbed video={v} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Private Sourcing teaser */}
      <section className="bg-night text-[#f1ead9]" aria-labelledby="private">
        <div className="container-page grid items-center gap-8 py-16 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">Private Sourcing</p>
            <h2 id="private" className="mt-3 text-5xl text-[#f1ead9]">
              Ferrari. Lamborghini. McLaren. Sourced for you.
            </h2>
            <p className="mt-4 max-w-md text-[#b9ae98]">A discreet, owner-led service for exotic and rare cars, from specification to your driveway.</p>
            <Link href="/private" className="btn mt-6 border border-champagne text-champagne hover:bg-champagne hover:text-night">
              Enquire privately
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src="/sample/exotic.svg" alt="Exotic car silhouette" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" unoptimized />
          </div>
        </div>
      </section>

      <section className="container-page py-12 text-center">
        <h2 className="text-4xl">Can&rsquo;t find it in stock?</h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-2">We buy from many APs every week. Tell us the model, budget and year, and we will find it for you.</p>
        <Link href="/find-me-a-car" className="btn btn-primary mt-5">
          Find me a car
        </Link>
      </section>
    </>
  );
}

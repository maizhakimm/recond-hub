import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarGrid } from "@/components/cars/CarCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { showroomJsonLd } from "@/components/seo/schemas";
import { AgentCard, ShowroomCard } from "@/components/site/ContactCards";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { agentsInState, hqAgents, listedStock, makeFacets, toSummary } from "@/lib/data/queries";
import { STATES } from "@/lib/states";

export const revalidate = 300;

export function generateStaticParams() {
  return STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[state]">): Promise<Metadata> {
  const { state } = await params;
  const st = STATES.find((s) => s.slug === state);
  if (!st) return {};
  return {
    title: `Recond Cars in ${st.name} · Kereta Recond ${st.name}`,
    description: `Buy recond cars in ${st.name}: showrooms, local agents and every car in stock near you. Harga kereta recond ${st.name}, auction sheet verified, WhatsApp us today.`,
    alternates: { canonical: `/${st.slug}` },
  };
}

export default async function StatePage({ params }: PageProps<"/[state]">) {
  const [{ state }, data] = await Promise.all([params, getSiteData()]);
  const st = STATES.find((s) => s.slug === state);
  if (!st) notFound();

  const showrooms = data.showrooms.filter((s) => s.stateSlug === st.slug);
  const agents = agentsInState(data, st.slug);
  const hq = hqAgents(data);
  const stock = listedStock(data).filter((c) => c.stateSlug === st.slug);
  const available = stock.filter((c) => c.status !== "Sold");
  const topMakes = makeFacets(available).slice(0, 4).map((m) => m.make);

  return (
    <div className="container-page py-6">
      {showrooms.map((s) => (
        <JsonLd key={s.showroom_id} data={showroomJsonLd(s)} />
      ))}
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Showrooms", href: "/showrooms" },
          { name: st.name, href: `/${st.slug}` },
        ]}
      />
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl">Recond cars in {st.name}</h1>
        <p className="mt-2 max-w-3xl text-ink-2">
          Kereta recond {st.name}: {available.length ? `${available.length} cars in stock in ${st.name} today` : `cars delivered anywhere in ${st.name}`}
          {showrooms.length ? `, ${showrooms.length} showroom${showrooms.length > 1 ? "s" : ""}` : ""}
          {agents.length ? ` and ${agents.length} local agent${agents.length > 1 ? "s" : ""}` : ""}. Every car can also be sent from any {BRAND} showroom in Malaysia.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="sr">
          <h2 id="sr" className="mb-4 text-3xl">
            Showrooms in {st.name}
          </h2>
          {showrooms.length ? (
            <div className="grid gap-4">
              {showrooms.map((s) => (
                <ShowroomCard key={s.showroom_id} s={s} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line bg-card p-5 text-ink-2">
              No showroom in {st.name} yet. Our agents and HQ can arrange viewings, video calls and delivery to {st.name}. See{" "}
              <Link href="/showrooms" className="font-medium text-gold-text underline">
                all showrooms
              </Link>
              .
            </p>
          )}
        </section>

        <section aria-labelledby="ag">
          <h2 id="ag" className="mb-4 text-3xl">
            {agents.length ? `Agents in ${st.name}` : "Talk to HQ"}
          </h2>
          <div className="grid gap-3">
            {(agents.length ? agents : hq).map((a) => (
              <AgentCard key={a.agent_id} agent={a} label={agents.length ? `Agent · ${st.name}` : "HQ sales advisor"} />
            ))}
          </div>
          {!agents.length && (
            <div className="mt-4 rounded-xl bg-ink p-5 text-paper">
              <p className="text-2xl">Become our agent in {st.name}</p>
              <p className="mt-1 text-sm text-[#c5cad3]">Know cars and people in {st.name}? Earn commission selling recond cars with {BRAND}&rsquo;s stock and support.</p>
              <Link href={`/become-an-agent?state=${st.slug}`} className="btn btn-gold mt-3">
                Apply now
              </Link>
            </div>
          )}
        </section>
      </div>

      <section className="mt-14" aria-labelledby="stock">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 id="stock" className="text-3xl">
            In stock in {st.name}
          </h2>
          {stock.length > 12 && (
            <Link href={`/cars?state=${st.slug}`} className="font-medium text-gold-text underline">
              See all {stock.length}
            </Link>
          )}
        </div>
        {stock.length ? (
          <CarGrid cars={stock.slice(0, 12).map((c) => toSummary(c, data.settings))} />
        ) : (
          <p className="text-ink-2">
            Nothing parked in {st.name} right now, but any car in{" "}
            <Link href="/cars" className="font-medium text-gold-text underline">
              our nationwide stock
            </Link>{" "}
            can be viewed by video call and delivered to you.
          </p>
        )}
      </section>

      <section className="prose prose-stone mt-14 max-w-3xl">
        <h2>Buying a recond car in {st.name}</h2>
        <p>
          Looking for a kereta recond in {st.name}? {BRAND} imports reconditioned cars from Japanese and UK auctions and sells them with the original auction
          sheet, a full inspection and warranty.{" "}
          {topMakes.length ? `Popular in ${st.name} right now: ${topMakes.join(", ")}.` : "Popular choices include the Toyota Alphard, Vellfire and Harrier."}{" "}
          Prices (harga) shown are cash prices; use the monthly figure on each car or our <Link href="/loan-calculator">loan calculator</Link> to plan your hire
          purchase.
        </p>
        <p>
          Can&rsquo;t see the model you want? <Link href="/find-me-a-car">Tell us what you&rsquo;re looking for</Link> and our team will source it from our
          network of APs.
        </p>
      </section>

      <nav aria-label="Other states" className="mt-10">
        <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted">Other states</h2>
        <ul className="flex flex-wrap gap-2">
          {STATES.filter((s) => s.slug !== st.slug).map((s) => (
            <li key={s.slug}>
              <Link href={`/${s.slug}`} className="chip">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

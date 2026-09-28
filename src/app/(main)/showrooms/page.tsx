import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { showroomJsonLd } from "@/components/seo/schemas";
import { ShowroomCard } from "@/components/site/ContactCards";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { activeAgents, listedStock } from "@/lib/data/queries";
import { STATES } from "@/lib/states";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Showrooms & Agents Across Malaysia · Find Us by State",
  description: `Find a ${BRAND} recond showroom or agent near you. Addresses, opening hours, directions and WhatsApp for every state in Malaysia.`,
  alternates: { canonical: "/showrooms" },
};

export default async function ShowroomsPage() {
  const data = await getSiteData();
  const agents = activeAgents(data);
  const stock = listedStock(data);
  return (
    <div className="container-page py-6">
      {data.showrooms.map((s) => (
        <JsonLd key={s.showroom_id} data={showroomJsonLd(s)} />
      ))}
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Showrooms", href: "/showrooms" },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">Find us by state</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {data.showrooms.length} showrooms and {agents.filter((a) => a.stateSlug !== "hq").length} agents nationwide. Pick your state to see local stock and
        contacts.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATES.map((s) => {
          const n = data.showrooms.filter((x) => x.stateSlug === s.slug).length;
          const a = agents.filter((x) => x.stateSlug === s.slug).length;
          const c = stock.filter((x) => x.stateSlug === s.slug).length;
          return (
            <li key={s.slug}>
              <Link href={`/${s.slug}`} className="block rounded-lg border border-line bg-card p-3 hover:border-gold">
                <span className="font-semibold">{s.name}</span>
                <span className="mt-0.5 block text-xs text-muted tnum">
                  {n} showroom{n === 1 ? "" : "s"} · {a} agent{a === 1 ? "" : "s"} · {c} cars
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-4 mt-12 text-3xl">All showrooms</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.showrooms.map((s) => (
          <ShowroomCard key={s.showroom_id} s={s} />
        ))}
      </div>
    </div>
  );
}

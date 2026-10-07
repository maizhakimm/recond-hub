import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarGrid } from "@/components/cars/CarCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listedStock, toSummary } from "@/lib/data/queries";
import { STATES } from "@/lib/states";

export const revalidate = 300;

// State / Federal Territory flags. Wikimedia Commons is used as the source so the artwork can be
// reviewed independently. These are presentation-only; enquiries still route through RecondHub.
const STATE_FLAGS: Record<string, string> = {
  johor: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Johor.svg",
  kedah: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Kedah.svg",
  kelantan: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Kelantan.svg",
  melaka: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Malacca.svg",
  "negeri-sembilan": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Negeri_Sembilan.svg",
  pahang: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Pahang.svg",
  penang: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Penang_(Malaysia).svg",
  perak: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Perak.svg",
  perlis: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Perlis.svg",
  selangor: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Selangor.svg",
  terengganu: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Terengganu.svg",
  "kuala-lumpur": "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Kuala_Lumpur,_Malaysia.svg",
  putrajaya: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Flag_of_Putrajaya.svg",
};

export function generateStaticParams() { return STATES.map((s) => ({ state: s.slug })); }

export async function generateMetadata({ params }: PageProps<"/[state]">): Promise<Metadata> {
  const { state } = await params;
  const st = STATES.find((s) => s.slug === state);
  if (!st) return {};
  return {
    title: `Recond Cars in ${st.name} · Kereta Recond ${st.name}`,
    description: `Looking for a recond car in ${st.name}? ${BRAND} helps buyers across ${st.name} purchase quality reconditioned vehicles through our Peninsular Malaysia sales network.`,
    alternates: { canonical: `/${st.slug}` },
  };
}

export default async function StatePage({ params }: PageProps<"/[state]">) {
  const [{ state }, data] = await Promise.all([params, getSiteData()]);
  const st = STATES.find((s) => s.slug === state);
  if (!st) notFound();
  const allStock = listedStock(data).filter((c) => c.status !== "Sold");
  const localStock = allStock.filter((c) => c.stateSlug === st.slug);
  const displayStock = localStock.length ? localStock : allStock.slice(0, 12);

  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Coverage", href: "/showrooms" }, { name: st.name, href: `/${st.slug}` }]} />
      <header className="mb-8 max-w-3xl">
        <p className="eyebrow">RecondHub coverage · {st.name}</p>
        <h1 className="text-4xl sm:text-5xl">Recond cars for buyers in {st.name}</h1>
        <p className="mt-3 text-lg text-ink-2">Live in {st.name}? You can still buy from {BRAND}. Our main vehicle operations are based in the Klang Valley, while our sales network helps customers across Peninsular Malaysia with enquiries and the buying process.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-md border border-line bg-card p-6">
          <h2 className="text-3xl">How it works from {st.name}</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2">
            {[["1", "Browse or request a car", "Choose from available stock or tell us the model you want."], ["2", "Talk to our sales network", `Get assistance for your enquiry from ${st.name}.`], ["3", "Confirm the vehicle", "Review vehicle details, auction information and the applicable purchase arrangement."], ["4", "Complete your purchase", "Our team coordinates the next steps with you without requiring you to be based in Klang Valley."]].map(([n,t,d]) => <li key={n} className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-paper">{n}</span><div><p className="font-bold">{t}</p><p className="mt-1 text-sm text-ink-2">{d}</p></div></li>)}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 text-3xl">Sales assistance in {st.name}</h2>
          <div className="rounded-md border border-line bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-white shadow-sm">
                <img src={STATE_FLAGS[st.slug]} alt={`${st.name} flag`} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div>
                <p className="text-lg font-bold">RecondHub Sales Advisor – {st.name}</p>
                <p className="mt-1 text-sm text-ink-2">Local sales assistance for buyers in {st.name}. No individual agent details are displayed.</p>
              </div>
            </div>
            <Link href="/find-me-a-car" className="btn btn-wa mt-5 w-full">WhatsApp RecondHub</Link>
          </div>
          <p className="mt-3 text-sm text-muted">Sales coverage does not mean a physical RecondHub showroom or vehicle stock is located in {st.name}.</p>
        </section>
      </div>

      <section className="mt-14" aria-labelledby="stock">
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Available cars</p><h2 id="stock" className="text-3xl">{localStock.length ? `Stock listed in ${st.name}` : "Cars you can buy through RecondHub"}</h2></div><Link href="/cars" className="font-medium text-gold-text underline">Browse all cars</Link></div>
        <CarGrid cars={displayStock.slice(0, 12).map((c) => toSummary(c, data.settings))} />
        {!localStock.length && <p className="mt-4 text-sm text-muted">These vehicles are not represented as being physically located in {st.name}. Contact us to confirm the vehicle location and purchase arrangement.</p>}
      </section>

      <section className="prose prose-stone mt-14 max-w-3xl">
        <h2>Buying a recond car from {st.name}</h2>
        <p>You do not need a RecondHub showroom in your state to start buying a reconditioned car. Browse our current stock online, review the available vehicle information and contact our sales network. If you cannot find the model you want, <Link href="/find-me-a-car">tell us what you are looking for</Link>.</p>
      </section>

      <nav aria-label="Other coverage areas" className="mt-10"><h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted">Other coverage areas</h2><ul className="flex flex-wrap gap-2">{STATES.filter((s) => s.slug !== st.slug).map((s) => <li key={s.slug}><Link href={`/${s.slug}`} className="chip">{s.name}</Link></li>)}</ul></nav>
    </div>
  );
}

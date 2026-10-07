import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { activeAgents } from "@/lib/data/queries";
import { STATES } from "@/lib/states";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Recond Car Coverage Across Peninsular Malaysia",
  description: `${BRAND} is based in the Klang Valley and assists recond car buyers across Peninsular Malaysia through our sales and agent network.`,
  alternates: { canonical: "/showrooms" },
};

export default async function CoveragePage() {
  const data = await getSiteData();
  const agents = activeAgents(data);
  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Coverage", href: "/showrooms" }]} />
      <div className="max-w-3xl">
        <p className="eyebrow">Peninsular Malaysia coverage</p>
        <h1 className="text-4xl sm:text-5xl">Your recond car, wherever you are.</h1>
        <p className="mt-3 text-lg text-ink-2">
          Our main vehicle operations are based in the Klang Valley, but you do not need to live in KL or Selangor to buy from {BRAND}. We assist buyers across Peninsular Malaysia through our sales and agent network, from first enquiry to completing the purchase.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Browse from anywhere", "View available recond cars online without travelling to Klang Valley first."],
          ["Local sales assistance", "Connect with a RecondHub sales contact or agent covering your state."],
          ["Nationwide buying support", "Our team can coordinate the buying process for customers throughout Peninsular Malaysia."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-md border border-line bg-card p-5"><h2 className="text-xl">{title}</h2><p className="mt-2 text-sm text-ink-2">{text}</p></div>
        ))}
      </div>

      <h2 className="mt-12 text-3xl">Choose your state</h2>
      <p className="mt-2 max-w-2xl text-ink-2">See buying information and available local assistance for your area. Vehicle stock may be physically located in the Klang Valley or another listed location.</p>
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STATES.map((s) => {
          const a = agents.filter((x) => x.stateSlug === s.slug).length;
          return <li key={s.slug}><Link href={`/${s.slug}`} className="block rounded-lg border border-line bg-card p-3 hover:border-gold"><span className="font-semibold">{s.name}</span><span className="mt-0.5 block text-xs text-muted">{a ? `${a} local agent${a > 1 ? "s" : ""}` : "Sales assistance available"}</span></Link></li>;
        })}
      </ul>

      <div className="mt-12 rounded-md bg-ink p-6 text-paper sm:flex sm:items-center sm:justify-between sm:gap-8">
        <div><h2 className="text-3xl">Not based in Klang Valley?</h2><p className="mt-2 max-w-2xl text-sm text-[#c5cad3]">No problem. Tell us the car you want and where you are. We will guide you through the next step.</p></div>
        <Link href="/find-me-a-car" className="btn btn-gold mt-4 shrink-0 sm:mt-0">Find me a car</Link>
      </div>
    </div>
  );
}

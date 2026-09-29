import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarGrid } from "@/components/cars/CarCard";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";
import { AgentAvatar } from "@/components/site/ContactCards";
import { CopyLink } from "@/components/site/CopyLink";
import { BRAND, SITE_URL } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { activeAgents, listedStock, toSummary } from "@/lib/data/queries";

export const revalidate = 300;

export async function generateStaticParams() {
  return activeAgents(await getSiteData()).map((a) => ({ id: a.agent_id.toLowerCase() }));
}

async function findAgent(id: string) {
  const data = await getSiteData();
  return { data, agent: activeAgents(data).find((a) => a.agent_id.toLowerCase() === id.toLowerCase()) };
}

export async function generateMetadata({ params }: PageProps<"/agent/[id]">): Promise<Metadata> {
  const { id } = await params;
  const { agent } = await findAgent(id);
  if (!agent) return {};
  const where = agent.stateSlug === "hq" ? "HQ" : agent.state;
  return {
    title: `${agent.name} · ${BRAND} Agent ${where}`,
    description: `WhatsApp ${agent.name}, your ${BRAND} recond car agent in ${where}. Browse stock, book a viewing and get a loan estimate.`,
    alternates: { canonical: `/agent/${agent.agent_id.toLowerCase()}` },
  };
}

/** Agent profile. Agents share `/agent/<id>?ref=<ID>` (or any page with ?ref=) so their visitors' leads come to them for 30 days. */
export default async function AgentPage({ params }: PageProps<"/agent/[id]">) {
  const { id } = await params;
  const { data, agent } = await findAgent(id);
  if (!agent) notFound();
  const isHq = agent.stateSlug === "hq";
  const cars = listedStock(data)
    .filter((c) => c.status !== "Sold" && (isHq || c.stateSlug === agent.stateSlug))
    .slice(0, 8);
  const shareUrl = `${SITE_URL}/agent/${agent.agent_id.toLowerCase()}?ref=${agent.agent_id}`;
  return (
    <div className="container-page py-8">
      <div className="flex flex-col items-start gap-5 rounded-md border border-line bg-card p-6 sm:flex-row sm:items-center">
        <AgentAvatar agent={agent} size={96} />
        <div className="flex-1">
          <p className="eyebrow">{isHq ? "HQ sales advisor" : `${BRAND} agent · ${agent.state}`}</p>
          <h1 className="text-4xl">{agent.name}</h1>
          <p className="mt-1 text-ink-2">
            {isHq ? "Helping buyers nationwide from our HQ." : `Your local recond specialist in ${agent.state}.`}{" "}
            {!isHq && (
              <Link href={`/${agent.stateSlug}`} className="font-medium text-gold-text underline">
                Showrooms in {agent.state}
              </Link>
            )}
          </p>
        </div>
        <WhatsAppButton label={`WhatsApp ${agent.name.split(" ")[0]}`} agentId={agent.agent_id} message={`Hi ${agent.name.split(" ")[0]}, I'm looking for a recond car.`} />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-3xl">{isHq ? "Latest stock" : `Stock in ${agent.state}`}</h2>
        {cars.length ? <CarGrid cars={cars.map((c) => toSummary(c, data.settings))} /> : <p className="text-ink-2">Ask {agent.name.split(" ")[0]} about cars from our other showrooms.</p>}
        <Link href="/cars" className="btn btn-outline mt-6">
          Browse all stock
        </Link>
      </section>

      <section className="mt-10 rounded-md border border-dashed border-line p-5">
        <h2 className="font-sans text-base font-semibold tracking-normal">For {agent.name.split(" ")[0]}: your personal link</h2>
        <p className="mt-1 text-sm text-ink-2">Share this link on TikTok, WhatsApp status or Instagram. Anyone who opens it is routed to you for 30 days.</p>
        <CopyLink url={shareUrl} />
      </section>
    </div>
  );
}

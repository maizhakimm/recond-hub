import Image from "next/image";
import Link from "next/link";
import type { Agent, Showroom } from "@/lib/data/types";
import { ClockIcon, PinIcon } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";

export function ShowroomCard({ s, carCode }: { s: Showroom; carCode?: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <p className="eyebrow">Showroom</p>
      <h3 className="mt-1 font-sans text-lg font-semibold tracking-normal">{s.name}</h3>
      <p className="mt-2 flex gap-2 text-sm text-ink-2">
        <PinIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{s.address || `${s.city}, ${s.stateName}`}</span>
      </p>
      {s.opening_hours && (
        <p className="mt-1 flex gap-2 text-sm text-ink-2">
          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{s.opening_hours}</span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {s.google_maps_url && (
          <a href={s.google_maps_url} target="_blank" rel="noopener" className="btn btn-outline flex-1">
            Directions
          </a>
        )}
        <WhatsAppButton
          className="btn btn-wa flex-1"
          label="WhatsApp showroom"
          showroomId={s.showroom_id}
          carCode={carCode}
          state={s.stateSlug}
          message={`Hi ${s.name}, ${carCode ? `I'm asking about car #${carCode}.` : "I'd like to visit your showroom."}`}
        />
      </div>
    </div>
  );
}

export function AgentAvatar({ agent, size = 56 }: { agent: Agent; size?: number }) {
  if (agent.photo)
    return <Image src={agent.photo} alt={agent.name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  const initials = agent.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-ink font-serif text-lg text-champagne" style={{ width: size, height: size }} aria-hidden>
      {initials}
    </span>
  );
}

export function AgentCard({ agent, carCode, label = "Your local agent" }: { agent: Agent; carCode?: string; label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
      <AgentAvatar agent={agent} />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">{label}</p>
        <p className="font-semibold">
          <Link href={`/agent/${agent.agent_id.toLowerCase()}`} className="hover:underline">
            {agent.name}
          </Link>
        </p>
        <p className="text-sm text-muted">{agent.state === "HQ" ? "HQ sales advisor" : agent.state}</p>
      </div>
      <WhatsAppButton
        className="btn btn-wa px-3"
        label="Chat"
        ariaLabel={`WhatsApp ${agent.name}`}
        agentId={agent.agent_id}
        carCode={carCode}
        state={agent.stateSlug === "hq" ? undefined : agent.stateSlug}
        message={`Hi ${agent.name.split(" ")[0]}, ${carCode ? `I'm asking about car #${carCode}.` : "I'm looking for a recond car."}`}
      />
    </div>
  );
}

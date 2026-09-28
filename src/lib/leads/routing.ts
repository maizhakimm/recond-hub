import { findState } from "../states";
import { activeAgents, hqAgents } from "../data/queries";
import type { Agent, SiteData } from "../data/types";
import type { LeadType } from "./types";

export type RouteInput = {
  type: LeadType;
  carCode?: string;
  buyerState?: string;
  showroomId?: string;
  refAgentId?: string;
  directAgentId?: string;
  directShowroomId?: string;
  now?: number;
};
export type RouteResult = { whatsapp: string; assignedTo: string; rule: string };

/** Stateless round-robin: rotates every minute so simultaneous leads in one state spread across agents. */
export function pickRoundRobin<T>(items: T[], now = Date.now()): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(now / 60000) % items.length];
}

function hqFallback(data: SiteData, now: number): RouteResult {
  const sa = pickRoundRobin(hqAgents(data), now);
  if (sa) return { whatsapp: sa.whatsapp, assignedTo: sa.agent_id, rule: "hq_round_robin" };
  return { whatsapp: data.settings.hqWhatsapp, assignedTo: "HQ", rule: "hq_number" };
}

function findActiveAgent(data: SiteData, id?: string): Agent | undefined {
  if (!id) return undefined;
  return activeAgents(data).find((a) => a.agent_id === id.toUpperCase());
}

/**
 * Lead routing, applied before opening WhatsApp:
 * 1. private_sourcing → owner_whatsapp, always.
 *    (a "Chat" button on a named agent or showroom card goes straight to them)
 * 2. viewing_booking → the selected showroom (assigned_to = ref agent if any, else the showroom).
 * 3. agent_application → HQ.
 * 4. ref cookie (agent link) → that agent.
 * 5. find_me_a_car → HQ.
 * 6. other leads → active agent in buyer's state (form, else car's state), round-robin.
 * 7. no agent in that state → HQ SAs round-robin, else hq_whatsapp.
 */
export function routeLead(data: SiteData, input: RouteInput): RouteResult {
  const now = input.now ?? Date.now();
  if (input.type === "private_sourcing") {
    return { whatsapp: data.settings.ownerWhatsapp, assignedTo: "OWNER", rule: "owner" };
  }
  // A button on a named agent's or showroom's card must reach that person, not the rotation.
  const direct = findActiveAgent(data, input.directAgentId);
  if (direct) return { whatsapp: direct.whatsapp, assignedTo: direct.agent_id, rule: "direct_agent" };
  const directShowroom = input.directShowroomId ? data.showrooms.find((s) => s.showroom_id === input.directShowroomId) : undefined;
  if (directShowroom) return { whatsapp: directShowroom.whatsapp, assignedTo: directShowroom.showroom_id, rule: "direct_showroom" };

  const ref = findActiveAgent(data, input.refAgentId);

  if (input.type === "viewing_booking") {
    const showroom = data.showrooms.find((s) => s.showroom_id === input.showroomId);
    if (showroom) {
      return { whatsapp: showroom.whatsapp, assignedTo: ref?.agent_id ?? showroom.showroom_id, rule: "showroom" };
    }
  }

  if (input.type === "agent_application") return hqFallback(data, now);

  if (ref) return { whatsapp: ref.whatsapp, assignedTo: ref.agent_id, rule: "ref_link" };

  if (input.type === "find_me_a_car") return hqFallback(data, now);

  const car = input.carCode ? data.stock.find((c) => c.code === input.carCode?.toUpperCase()) : undefined;
  const stateSlug = findState(input.buyerState)?.slug ?? car?.stateSlug;
  if (stateSlug) {
    const agent = pickRoundRobin(
      activeAgents(data).filter((a) => a.stateSlug === stateSlug),
      now,
    );
    if (agent) return { whatsapp: agent.whatsapp, assignedTo: agent.agent_id, rule: "state_agent" };
  }
  return hqFallback(data, now);
}

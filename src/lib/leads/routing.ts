import type { SiteData } from "../data/types";
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

/** Kept for components that use the shared round-robin helper. */
export function pickRoundRobin<T>(items: T[], now = Date.now()): T | undefined {
  if (!items.length) return undefined;
  return items[Math.floor(now / 60000) % items.length];
}

/**
 * Temporary launch routing:
 * Send every website WhatsApp enquiry to one central RecondHub number.
 * We keep the original lead context (state, car, source page, etc.) in the Leads sheet,
 * so state/agent routing can be enabled later without changing the forms.
 */
const CENTRAL_WHATSAPP = "60138388371";

export function routeLead(_data: SiteData, _input: RouteInput): RouteResult {
  return {
    whatsapp: CENTRAL_WHATSAPP,
    assignedTo: "CENTRAL",
    rule: "central_whatsapp",
  };
}

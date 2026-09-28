import { z } from "zod";

export const LEAD_TYPES = [
  "whatsapp_enquiry",
  "viewing_booking",
  "loan",
  "trade_in",
  "find_me_a_car",
  "private_sourcing",
  "agent_application",
] as const;
export type LeadType = (typeof LEAD_TYPES)[number];

const s = (max: number) => z.string().trim().max(max).optional().default("");

export const leadInput = z.object({
  type: z.enum(LEAD_TYPES),
  car_code: s(20),
  name: s(120),
  phone: s(30),
  state: s(40), // buyer's state slug or name
  showroom_id: s(40),
  agent_id: s(20), // "Chat with this agent" buttons: route straight to them
  direct: z.enum(["agent", "showroom"]).optional(),
  preferred_date: s(20),
  preferred_time: s(20),
  details: z.record(z.string(), z.union([z.string().max(1000), z.number(), z.boolean()])).optional().default({}),
  source_page: s(500),
  utm_source: s(120),
  utm_campaign: s(120),
  website: s(200), // honeypot, must stay empty
});
export type LeadInput = z.infer<typeof leadInput>;

export type LeadResponse = { ok: true; whatsapp: string; assigned_to: string } | { ok: false; error: string };

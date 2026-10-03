import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REF_COOKIE, UTM_COOKIE } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { LEAD_TYPE_LABELS } from "@/lib/data/columns";
import { appendRow } from "@/lib/data/sheets";
import { routeLead } from "@/lib/leads/routing";
import { leadInput, type LeadResponse } from "@/lib/leads/types";
import { findState } from "@/lib/states";
import { normalizeMsisdn } from "@/lib/whatsapp";

/** Sheets treats a leading = + - @ as a formula; RAW input already prevents that, this is belt and braces. */
function safe(v: string): string {
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
}

/**
 * Light spam guard: at most 12 leads per IP per 10 minutes, per server instance.
 * Real buyers never get near this; scripted floods get a 429 and nothing is written to the sheet.
 */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 12;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > RATE_WINDOW_MS) hits.delete(k);
  return recent.length > RATE_MAX;
}

/** Plain-language summary for the "Maklumat Tambahan" column, e.g. "price: 238000 · years: 9 · laluan: agen negeri". */
const ROUTE_LABELS: Record<string, string> = {
  owner: "terus kepada owner",
  direct_agent: "agen yang dipilih",
  direct_showroom: "showroom yang dipilih",
  showroom: "showroom yang dipilih",
  ref_link: "pautan agen",
  state_agent: "agen negeri",
  hq_round_robin: "SA HQ (bergilir)",
  hq_number: "nombor HQ",
};
function detailsText(details: Record<string, string | number | boolean>, rule: string, ref?: string): string {
  const parts = Object.entries(details)
    .filter(([, v]) => v !== "" && v !== undefined)
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
  parts.push(`laluan: ${ROUTE_LABELS[rule] ?? rule}`);
  if (ref) parts.push(`pautan agen: ${ref}`);
  return parts.join(" · ");
}

function nowMalaysia(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kuala_Lumpur" }); // 2026-09-28 17:45:00
}

export async function POST(req: Request): Promise<NextResponse<LeadResponse>> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: "too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }
  const parsed = leadInput.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid lead" }, { status: 400 });
  const lead = parsed.data;

  const data = await getSiteData();
  // Bots filling the hidden honeypot get a normal-looking answer but nothing is logged.
  if (lead.website) return NextResponse.json({ ok: true, whatsapp: data.settings.hqWhatsapp, assigned_to: "" });

  const jar = await cookies();
  const ref = jar.get(REF_COOKIE)?.value;
  let utm: { utm_source?: string; utm_campaign?: string } = {};
  try {
    utm = JSON.parse(jar.get(UTM_COOKIE)?.value ?? "{}");
  } catch {
    // ignore malformed cookie
  }

  const route = routeLead(data, {
    type: lead.type,
    carCode: lead.car_code,
    buyerState: lead.state,
    showroomId: lead.showroom_id,
    refAgentId: ref,
    directAgentId: lead.direct === "agent" ? lead.agent_id : undefined,
    directShowroomId: lead.direct === "showroom" ? lead.showroom_id : undefined,
  });

  const row = {
    timestamp: nowMalaysia(),
    type: LEAD_TYPE_LABELS[lead.type] ?? lead.type,
    car_code: safe(lead.car_code.toUpperCase()),
    name: safe(lead.name),
    phone: normalizeMsisdn(lead.phone) || safe(lead.phone),
    state: findState(lead.state)?.name ?? safe(lead.state),
    showroom_id: safe(lead.showroom_id),
    preferred_date: safe(lead.preferred_date),
    preferred_time: safe(lead.preferred_time),
    details_json: safe(detailsText(lead.details, route.rule, ref)),
    assigned_to: route.assignedTo,
    source_page: safe(lead.source_page),
    utm_source: safe(lead.utm_source || utm.utm_source || ""),
    utm_campaign: safe(lead.utm_campaign || utm.utm_campaign || ""),
    status: "New",
  };

  try {
    // Never let a slow Sheets API block the buyer from reaching WhatsApp.
    await Promise.race([appendRow("Leads", row), new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))]);
  } catch (err) {
    console.error("[leads] failed to log lead, continuing to WhatsApp", err, row);
  }

  return NextResponse.json({ ok: true, whatsapp: route.whatsapp, assigned_to: route.assignedTo });
}

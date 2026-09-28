import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { REF_COOKIE, UTM_COOKIE } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { appendRow } from "@/lib/data/sheets";
import { routeLead } from "@/lib/leads/routing";
import { leadInput, type LeadResponse } from "@/lib/leads/types";
import { findState } from "@/lib/states";
import { normalizeMsisdn } from "@/lib/whatsapp";

/** Sheets treats a leading = + - @ as a formula; RAW input already prevents that, this is belt and braces. */
function safe(v: string): string {
  return /^[=+\-@]/.test(v) ? `'${v}` : v;
}

function nowMalaysia(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kuala_Lumpur" }); // 2026-09-28 17:45:00
}

export async function POST(req: Request): Promise<NextResponse<LeadResponse>> {
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
    type: lead.type,
    car_code: safe(lead.car_code.toUpperCase()),
    name: safe(lead.name),
    phone: normalizeMsisdn(lead.phone) || safe(lead.phone),
    state: findState(lead.state)?.name ?? safe(lead.state),
    showroom_id: safe(lead.showroom_id),
    preferred_date: safe(lead.preferred_date),
    preferred_time: safe(lead.preferred_time),
    details_json: JSON.stringify({ ...lead.details, route: route.rule, ...(ref ? { ref } : {}) }),
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

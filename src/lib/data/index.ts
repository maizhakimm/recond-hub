import "server-only";
import { unstable_cache } from "next/cache";
import { REVALIDATE_SECONDS, SHEETS_CACHE_TAG } from "../config";
import { slugify } from "../slug";
import { findState, HQ } from "../states";
import { normalizeMsisdn } from "../whatsapp";
import { FEATURES } from "./columns";
import { readTab, sheetsConfigured } from "./sheets";
import { agentRow, settingsRow, showroomRow, stockRow, validateRows } from "./schema";
import type { Agent, Car, Settings, Showroom, SiteData } from "./types";

export function carSlug(c: { code: string; make: string; model: string; year_manufactured: number }): string {
  return slugify(`${c.code} ${c.make} ${c.model} ${c.year_manufactured}`);
}

const DEFAULT_SETTINGS: Settings = {
  hqWhatsapp: normalizeMsisdn(process.env.FALLBACK_HQ_WHATSAPP),
  ownerWhatsapp: normalizeMsisdn(process.env.FALLBACK_OWNER_WHATSAPP || process.env.FALLBACK_HQ_WHATSAPP),
  defaultInterestRate: 3,
  maxTenureYears: 9,
  minDownpaymentPct: 10,
  dsrEligibleMax: 60,
  dsrBorderlineMax: 70,
};

async function loadSiteData(): Promise<SiteData> {
  const warnings: string[] = [];
  // A failed read throws on purpose: ISR then keeps serving the last good pages instead of an empty site.
  const [stockRaw, showroomRaw, agentRaw, settingsRaw] = await Promise.all([
    readTab("Stock"),
    readTab("Showrooms"),
    readTab("Agents"),
    readTab("Settings"),
  ]);

  const showrooms: Showroom[] = validateRows("Showrooms", showroomRaw, showroomRow, warnings).map((s) => {
    const st = findState(s.state)!;
    return { ...s, stateSlug: st.slug, stateName: st.name };
  });
  const showroomById = new Map(showrooms.map((s) => [s.showroom_id, s]));

  const agents: Agent[] = validateRows("Agents", agentRaw, agentRow, warnings).map((a) => ({
    ...a,
    agent_id: a.agent_id.toUpperCase(),
    state: a.state.toUpperCase() === HQ ? HQ : findState(a.state)!.name,
    stateSlug: a.state.toUpperCase() === HQ ? "hq" : findState(a.state)!.slug,
  }));

  const seen = new Set<string>();
  const stock: Car[] = [];
  for (const row of validateRows("Stock", stockRaw, stockRow, warnings)) {
    if (seen.has(row.code)) {
      const msg = `[Stock] duplicate code ${row.code} skipped (first row wins)`;
      console.warn(msg);
      warnings.push(msg);
      continue;
    }
    const showroom = row.showroom_id ? showroomById.get(row.showroom_id) : undefined;
    if (row.showroom_id && !showroom) {
      warnings.push(`[Stock] ${row.code}: unknown showroom_id ${row.showroom_id} (car still listed)`);
    }
    const st = findState(row.state) ?? (showroom ? findState(showroom.state) : undefined);
    if (!st) {
      const msg = `[Stock] ${row.code} skipped: state "${row.state}" not recognised and no showroom to infer it from`;
      console.warn(msg);
      warnings.push(msg);
      continue;
    }
    seen.add(row.code);
    stock.push({
      ...row,
      showroom_id: showroom ? row.showroom_id : "",
      features: FEATURES.filter((f) => (row as Record<string, unknown>)[f.key] === true).map((f) => f.key),
      slug: carSlug(row),
      title: [row.make, row.model, row.variant].filter(Boolean).join(" "),
      makeSlug: slugify(row.make),
      modelSlug: slugify(row.model),
      stateSlug: st.slug,
      stateName: st.name,
    });
  }

  let settings = DEFAULT_SETTINGS;
  const parsedSettings = validateRows("Settings", settingsRaw.slice(0, 1), settingsRow, warnings)[0];
  if (parsedSettings) {
    settings = {
      hqWhatsapp: parsedSettings.hq_whatsapp,
      ownerWhatsapp: parsedSettings.owner_whatsapp,
      defaultInterestRate: parsedSettings.default_interest_rate,
      maxTenureYears: parsedSettings.max_tenure_years,
      minDownpaymentPct: parsedSettings.min_downpayment_pct,
      dsrEligibleMax: parsedSettings.dsr_eligible_max,
      dsrBorderlineMax: Math.max(parsedSettings.dsr_borderline_max, parsedSettings.dsr_eligible_max),
    };
  } else {
    warnings.push("[Settings] no valid settings row, using defaults");
  }

  return {
    stock,
    showrooms,
    agents,
    settings,
    warnings,
    loadedAt: new Date().toISOString(),
    source: sheetsConfigured() ? "sheets" : "sample",
  };
}

/** All sheet data, cached for 5 minutes and tagged so /api/revalidate can refresh it on demand. */
export const getSiteData = unstable_cache(loadSiteData, ["site-data-v1"], {
  tags: [SHEETS_CACHE_TAG],
  revalidate: REVALIDATE_SECONDS,
});

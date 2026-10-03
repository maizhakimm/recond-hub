import { z } from "zod";
import { findState, HQ } from "../states";
import { normalizeMsisdn } from "../whatsapp";

/* ---------- cell coercion helpers (sheet cells arrive as strings or numbers) ---------- */

const blank = (v: unknown) => v === undefined || v === null || String(v).trim() === "";

const text = z.preprocess((v) => (blank(v) ? "" : String(v).trim()), z.string());
const requiredText = z.preprocess((v) => (blank(v) ? undefined : String(v).trim()), z.string().min(1));

function toNumber(v: unknown): number | undefined {
  if (blank(v)) return undefined;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(/rm|km|cc|,|\s/gi, ""));
  return Number.isFinite(n) ? n : NaN;
}
const optNumber = z.preprocess(toNumber, z.number().nonnegative().optional());
const reqNumber = z.preprocess(toNumber, z.number().positive());
const year = z.preprocess(toNumber, z.number().int().min(1950).max(2100));
const optYear = z.preprocess(toNumber, z.number().int().min(1950).max(2100).optional());

const bool = z.preprocess((v) => /^(true|yes|y|1|ya)$/i.test(String(v ?? "").trim()), z.boolean());

const list = z.preprocess(
  (v) =>
    blank(v)
      ? []
      : String(v)
          .split(/[,\n]/)
          .map((s) => s.trim())
          .filter(Boolean),
  z.array(z.string()),
);

/** Accepts 2026-09-28, 28/09/2026, 28-9-2026, or a Sheets serial number. Returns YYYY-MM-DD. */
export function toIsoDate(v: unknown): string | undefined {
  if (blank(v)) return undefined;
  if (typeof v === "number") {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "invalid";
}
const optDate = z.preprocess(toIsoDate, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD or DD/MM/YYYY").optional());

const whatsapp = z.preprocess((v) => normalizeMsisdn(v as string), z.string().regex(/^60\d{8,11}$/, "whatsapp must look like 60XXXXXXXXX"));

/** Photo links: Google Drive share links become direct lh3.googleusercontent.com image URLs. */
export function normalizePhotoUrl(url: string): string {
  const u = url.trim();
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/);
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}=w1600`;
  return u;
}
const photoList = list.transform((arr) => arr.map(normalizePhotoUrl).filter((u) => u.startsWith("https://") || u.startsWith("/")));
const optPhoto = text.transform((v) => (v ? normalizePhotoUrl(v) : ""));

function caseEnum<T extends string>(values: readonly T[]) {
  return z.preprocess((v) => {
    const s = String(v ?? "").trim().toLowerCase();
    return values.find((x) => x.toLowerCase() === s) ?? v;
  }, z.enum(values as [T, ...T[]]));
}

/* ---------- tabs ---------- */

import { BODY_TYPES, STATUSES } from "./constants";
export { BODY_TYPES, STATUSES };
export type { BodyType } from "./constants";

export const stockRow = z.object({
  code: requiredText.pipe(z.string().regex(/^[A-Za-z]{1,5}-?\d{1,6}$/, "code must look like RH102")).transform((s) => s.toUpperCase().replace("-", "")),
  status: caseEnum(STATUSES),
  make: requiredText,
  model: requiredText,
  variant: text,
  year_manufactured: year,
  year_registered: optYear,
  body_type: caseEnum(BODY_TYPES),
  price_rm: reqNumber,
  mileage_km: optNumber,
  grade: text,
  engine_cc: optNumber,
  transmission: text,
  fuel: text,
  colour: text,
  showroom_id: text,
  state: text,
  photos: photoList,
  auction_sheet_url: optPhoto,
  highlights: list,
  description: text,
  featured: bool,
  date_added: optDate,
  sold_date: optDate,
});

export const showroomRow = z.object({
  showroom_id: requiredText,
  name: requiredText,
  state: requiredText.refine((s) => Boolean(findState(s)), "unknown Malaysian state"),
  city: text,
  address: text,
  google_maps_url: text,
  whatsapp,
  opening_hours: text,
  photo: optPhoto,
});

export const agentRow = z.object({
  agent_id: requiredText,
  name: requiredText,
  state: requiredText.refine((s) => s.toUpperCase() === HQ || Boolean(findState(s)), "state must be a Malaysian state or HQ"),
  showroom_id: text,
  whatsapp,
  photo: optPhoto,
  active: bool,
});

export const settingsRow = z.object({
  hq_whatsapp: whatsapp,
  owner_whatsapp: whatsapp,
  default_interest_rate: z.preprocess(toNumber, z.number().min(0).max(30).default(3)),
  max_tenure_years: z.preprocess(toNumber, z.number().int().min(1).max(9).default(9)),
  min_downpayment_pct: z.preprocess(toNumber, z.number().min(0).max(90).default(10)),
  dsr_eligible_max: z.preprocess(toNumber, z.number().min(1).max(200).default(60)),
  dsr_borderline_max: z.preprocess(toNumber, z.number().min(1).max(200).default(70)),
});

export type StockRow = z.infer<typeof stockRow>;
export type ShowroomRow = z.infer<typeof showroomRow>;
export type AgentRow = z.infer<typeof agentRow>;
export type SettingsRow = z.infer<typeof settingsRow>;

/** Validate rows; bad rows are skipped with a logged warning, never thrown. */
export function validateRows<T>(tab: string, rows: Record<string, unknown>[], schema: z.ZodType<T>, warnings: string[]): T[] {
  const out: T[] = [];
  for (const row of rows) {
    const res = schema.safeParse(row);
    if (res.success) out.push(res.data);
    else {
      const msg = `[${tab}] row ${row.__row ?? "?"} skipped: ${res.error.issues
        .map((i) => `${i.path.join(".") || "row"} ${i.message}`)
        .join("; ")}`;
      console.warn(msg);
      warnings.push(msg);
    }
  }
  return out;
}

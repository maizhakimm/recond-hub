import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { JWT } from "google-auth-library";
import { canonicalKey } from "./columns";
import { parseCsv } from "./csv";

/**
 * Thin Google Sheets REST client using a service account.
 * When SHEET_ID or GOOGLE_SERVICE_ACCOUNT_JSON is missing (local dev, preview builds),
 * reads fall back to /data/sample/<Tab>.csv and writes are logged to the console.
 */

export type RawRow = Record<string, unknown> & { __row: number };
export type Tab = "Stock" | "Showrooms" | "Agents" | "Leads" | "Settings";

const API = "https://sheets.googleapis.com/v4/spreadsheets";

let jwt: JWT | null = null;

function credentials(): { client_email: string; private_key: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    return { client_email: parsed.client_email, private_key: String(parsed.private_key).replace(/\\n/g, "\n") };
  } catch (err) {
    console.error("[sheets] GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON or base64 JSON", err);
    return null;
  }
}

export function sheetsConfigured(): boolean {
  return Boolean(process.env.SHEET_ID && credentials());
}

async function authHeader(): Promise<Record<string, string>> {
  if (!jwt) {
    const c = credentials();
    if (!c) throw new Error("Missing Google service account credentials");
    jwt = new JWT({ email: c.client_email, key: c.private_key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  }
  const { token } = await jwt.getAccessToken();
  return { Authorization: `Bearer ${token}` };
}

/** Rows → records keyed by internal column key. Headers may be friendly BM labels ("Harga (RM)") or keys ("price_rm"). */
function toRecords(tab: Tab, rows: unknown[][]): RawRow[] {
  const [header, ...body] = rows;
  if (!header) return [];
  const keys = header.map((h) => (String(h ?? "").trim() ? canonicalKey(tab, String(h)) : ""));
  return body.map((cells, i) => {
    const rec: RawRow = { __row: i + 2 };
    keys.forEach((k, j) => {
      if (k) rec[k] = cells[j] ?? "";
    });
    return rec;
  });
}

async function readSample(tab: Tab): Promise<RawRow[]> {
  const file = path.join(process.cwd(), "data", "sample", `${tab}.csv`);
  const text = await readFile(file, "utf8");
  return toRecords(tab, parseCsv(text));
}

export async function readTab(tab: Tab): Promise<RawRow[]> {
  if (!sheetsConfigured()) return readSample(tab);
  const url = `${API}/${process.env.SHEET_ID}/values/${encodeURIComponent(tab)}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`;
  const res = await fetch(url, { headers: await authHeader(), cache: "no-store" });
  if (!res.ok) throw new Error(`[sheets] read ${tab} failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { values?: unknown[][] };
  return toRecords(tab, json.values ?? []);
}

/** Append one row, matching values to the tab's header row so column order in the sheet can change. */
export async function appendRow(tab: Tab, record: Record<string, string | number>): Promise<void> {
  if (!sheetsConfigured()) {
    console.info(`[sheets] (sample mode) would append to ${tab}:`, record);
    return;
  }
  const headers = await authHeader();
  const headRes = await fetch(`${API}/${process.env.SHEET_ID}/values/${encodeURIComponent(`${tab}!1:1`)}`, {
    headers,
    cache: "no-store",
  });
  if (!headRes.ok) throw new Error(`[sheets] header ${tab} failed: ${headRes.status}`);
  const head = ((await headRes.json()) as { values?: string[][] }).values?.[0] ?? Object.keys(record);
  const row = head.map((h) => record[canonicalKey(tab, String(h))] ?? "");
  const res = await fetch(
    `${API}/${process.env.SHEET_ID}/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`[sheets] append ${tab} failed: ${res.status} ${await res.text()}`);
}

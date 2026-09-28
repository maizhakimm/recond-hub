/**
 * Parse opening hours written in the sheet, e.g.
 *   "Mon-Sat 10:00-19:00; Sun 11:00-17:00"   "Daily 10:00-19:00"   "Mon-Fri 9:30-18:00, Sat 10-16, Sun Closed"
 * into a per-weekday map (0 = Sunday). Unparseable text falls back to 10:00–18:00 every day.
 */
export type DayHours = { open: number; close: number } | null; // minutes from midnight

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const FALLBACK: DayHours = { open: 600, close: 1080 };

function dayIndex(token: string): number {
  return DAYS.indexOf(token.slice(0, 3).toLowerCase());
}

function toMinutes(t: string): number | undefined {
  const m = t.trim().match(/^(\d{1,2})(?::|\.)?(\d{2})?\s*(am|pm)?$/i);
  if (!m) return undefined;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 24 || min > 59) return undefined;
  return h * 60 + min;
}

export function parseOpeningHours(text: string | undefined): DayHours[] {
  const week: (DayHours | undefined)[] = Array(7).fill(undefined);
  let parsedAny = false;
  for (const raw of (text || "").split(/[;,\n]+/)) {
    const part = raw.trim();
    const m = part.match(/^([A-Za-z]{3,9}(?:\s*[-–]\s*[A-Za-z]{3,9})?|daily|everyday)\s+(.+)$/i);
    if (!m) continue;
    const [, daysPart, timePart] = m;
    let days: number[] = [];
    if (/^(daily|everyday)$/i.test(daysPart)) days = [0, 1, 2, 3, 4, 5, 6];
    else {
      const [a, b] = daysPart.split(/\s*[-–]\s*/);
      const start = dayIndex(a);
      const end = b ? dayIndex(b) : start;
      if (start < 0 || end < 0) continue;
      for (let i = start; ; i = (i + 1) % 7) {
        days.push(i);
        if (i === end) break;
      }
    }
    let hours: DayHours;
    if (/closed|tutup/i.test(timePart)) hours = null;
    else {
      const [o, c] = timePart.split(/\s*[-–]\s*/);
      const open = toMinutes(o ?? "");
      const close = toMinutes(c ?? "");
      if (open === undefined || close === undefined || close <= open) continue;
      hours = { open, close };
    }
    for (const d of days) week[d] = hours;
    parsedAny = true;
  }
  return week.map((d) => (d === undefined ? (parsedAny ? null : FALLBACK) : d));
}

/** Hourly viewing slots, last slot one hour before closing. */
export function slotsFor(hours: DayHours): string[] {
  if (!hours) return [];
  const out: string[] = [];
  for (let t = Math.ceil(hours.open / 60) * 60; t + 60 <= hours.close; t += 60) {
    const h = Math.floor(t / 60);
    const label = `${((h + 11) % 12) + 1}:00 ${h < 12 ? "AM" : "PM"}`;
    out.push(label);
  }
  return out;
}

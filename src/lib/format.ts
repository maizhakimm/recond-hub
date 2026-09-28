const rm = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 0 });

export function formatRM(value: number): string {
  return `RM ${rm.format(Math.round(value))}`;
}

export function formatKm(value: number | undefined): string {
  if (value === undefined) return "-";
  return `${rm.format(value)} km`;
}

export function formatNumber(value: number): string {
  return rm.format(value);
}

/** "2026-10-03" -> "Sat, 3 Oct 2026" */
export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/** Alt text convention: "{year} {make} {model} {colour}" */
export function carAlt(c: { year: number; make: string; model: string; colour?: string }, suffix = ""): string {
  return [c.year, c.make, c.model, c.colour, suffix].filter(Boolean).join(" ");
}

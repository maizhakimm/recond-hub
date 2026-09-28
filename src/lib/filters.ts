import type { CarSummary } from "./data/queries";

export type SortKey = "newest" | "price_asc" | "price_desc" | "year" | "mileage";
export const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
  { key: "year", label: "Year: newest first" },
  { key: "mileage", label: "Mileage: lowest first" },
];

export type Filters = {
  q: string;
  make: string;
  model: string;
  body: string;
  state: string;
  showroom: string;
  ymin?: number;
  ymax?: number;
  pmin?: number;
  pmax?: number;
  mmin?: number;
  mmax?: number;
  km?: number;
  grade?: number;
  trans: string;
  sort: SortKey;
};

export const EMPTY_FILTERS: Filters = { q: "", make: "", model: "", body: "", state: "", showroom: "", trans: "", sort: "newest" };

const NUM_KEYS = ["ymin", "ymax", "pmin", "pmax", "mmin", "mmax", "km", "grade"] as const;
const STR_KEYS = ["q", "make", "model", "body", "state", "showroom", "trans"] as const;

type Params = Record<string, string | string[] | undefined>;

export function parseFilters(params: Params): Filters {
  const get = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
  };
  const f: Filters = { ...EMPTY_FILTERS };
  for (const k of STR_KEYS) f[k] = get(k).slice(0, 80);
  for (const k of NUM_KEYS) {
    const n = Number(get(k));
    if (get(k) !== "" && Number.isFinite(n)) f[k] = n;
  }
  const sort = get("sort") as SortKey;
  if (SORTS.some((s) => s.key === sort)) f.sort = sort;
  return f;
}

/** Serialise to a query string, dropping defaults so URLs stay short and canonical. */
export function filtersToQuery(f: Filters, locked: Partial<Filters> = {}): string {
  const p = new URLSearchParams();
  for (const k of STR_KEYS) if (f[k] && f[k] !== locked[k]) p.set(k, f[k]);
  for (const k of NUM_KEYS) if (f[k] !== undefined) p.set(k, String(f[k]));
  if (f.sort !== "newest") p.set("sort", f.sort);
  return p.toString();
}

export function countActive(f: Filters, locked: Partial<Filters> = {}): number {
  let n = 0;
  for (const k of STR_KEYS) if (k !== "q" && f[k] && f[k] !== locked[k]) n++;
  for (const k of NUM_KEYS) if (f[k] !== undefined) n++;
  return n;
}

function gradeNum(g: string): number {
  const n = parseFloat(g);
  return Number.isFinite(n) ? n : 0;
}

/** Everything except the keyword search, which runs through Fuse first. */
export function applyFilters(cars: CarSummary[], f: Filters): CarSummary[] {
  const out = cars.filter(
    (c) =>
      (!f.make || c.makeSlug === f.make) &&
      (!f.model || c.modelSlug === f.model) &&
      (!f.body || c.body.toLowerCase() === f.body.toLowerCase()) &&
      (!f.state || c.stateSlug === f.state) &&
      (!f.showroom || c.showroomId === f.showroom) &&
      (!f.trans || c.transmission.toLowerCase().startsWith(f.trans.toLowerCase())) &&
      (f.ymin === undefined || c.year >= f.ymin) &&
      (f.ymax === undefined || c.year <= f.ymax) &&
      (f.pmin === undefined || c.price >= f.pmin) &&
      (f.pmax === undefined || c.price <= f.pmax) &&
      (f.mmin === undefined || c.monthly >= f.mmin) &&
      (f.mmax === undefined || c.monthly <= f.mmax) &&
      (f.km === undefined || (c.mileage ?? 0) <= f.km) &&
      (f.grade === undefined || gradeNum(c.grade) >= f.grade),
  );
  return out;
}

export function sortCars(cars: CarSummary[], sort: SortKey): CarSummary[] {
  const sold = (c: CarSummary) => (c.status === "Sold" ? 1 : 0);
  const cmp: Record<SortKey, (a: CarSummary, b: CarSummary) => number> = {
    newest: (a, b) => b.added.localeCompare(a.added) || b.code.localeCompare(a.code),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    year: (a, b) => b.year - a.year || b.added.localeCompare(a.added),
    mileage: (a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity),
  };
  return [...cars].sort((a, b) => sold(a) - sold(b) || cmp[sort](a, b));
}

import { SOLD_LISTED_DAYS, SOLD_PAGE_DAYS } from "../config";
import { fromMonthly } from "../loan";
import type { Agent, Car, Settings, Showroom, SiteData } from "./types";

const DAY = 86400000;

export function daysSince(iso: string | undefined, now = Date.now()): number {
  if (!iso) return Infinity;
  return (now - new Date(`${iso}T00:00:00+08:00`).getTime()) / DAY;
}

/** Listing visibility: Available + Reserved always, Sold for 7 days after sold_date, Hidden never. */
export function isListed(c: Car, now = Date.now()): boolean {
  if (c.status === "Hidden") return false;
  if (c.status === "Sold") return daysSince(c.sold_date, now) <= SOLD_LISTED_DAYS;
  return true;
}

export type CarPageState = "live" | "sold" | "redirect" | "gone";

/** Detail page: sold cars keep a "Sold + alternatives" page for 30 days, then 301 to the model page. */
export function carPageState(c: Car | undefined, now = Date.now()): CarPageState {
  if (!c || c.status === "Hidden") return "gone";
  if (c.status !== "Sold") return "live";
  return daysSince(c.sold_date, now) <= SOLD_PAGE_DAYS ? "sold" : "redirect";
}

export function listedStock(data: SiteData, now = Date.now()): Car[] {
  return sortNewest(data.stock.filter((c) => isListed(c, now)));
}

export function sortNewest(cars: Car[]): Car[] {
  const rank = (c: Car) => (c.status === "Sold" ? 1 : 0);
  return [...cars].sort((a, b) => rank(a) - rank(b) || (b.date_added ?? "").localeCompare(a.date_added ?? "") || b.code.localeCompare(a.code));
}

export function findCarBySlug(data: SiteData, slug: string): Car | undefined {
  const code = slug.split("-")[0]?.toUpperCase();
  return data.stock.find((c) => c.code === code);
}

export function activeAgents(data: SiteData): Agent[] {
  return data.agents.filter((a) => a.active);
}

export function agentsInState(data: SiteData, stateSlug: string): Agent[] {
  return activeAgents(data).filter((a) => a.stateSlug === stateSlug);
}

export function hqAgents(data: SiteData): Agent[] {
  return activeAgents(data).filter((a) => a.stateSlug === "hq");
}

export function showroomFor(data: SiteData, car: Car): Showroom | undefined {
  return data.showrooms.find((s) => s.showroom_id === car.showroom_id);
}

/** Showroom the viewing modal defaults to: the car's own, else one in the same state, else the first. */
export function defaultShowroom(data: SiteData, car: Car): Showroom | undefined {
  return showroomFor(data, car) ?? data.showrooms.find((s) => s.stateSlug === car.stateSlug) ?? data.showrooms[0];
}

/** Related: same model first, then same body type within ±30% price, excluding sold. */
export function relatedCars(data: SiteData, car: Car, limit = 4): Car[] {
  const pool = listedStock(data).filter((c) => c.code !== car.code && c.status !== "Sold");
  const sameModel = pool.filter((c) => c.makeSlug === car.makeSlug && c.modelSlug === car.modelSlug);
  const sameBody = pool
    .filter((c) => !sameModel.includes(c) && c.body_type === car.body_type && Math.abs(c.price_rm - car.price_rm) <= car.price_rm * 0.3)
    .sort((a, b) => Math.abs(a.price_rm - car.price_rm) - Math.abs(b.price_rm - car.price_rm));
  const sameBand = pool
    .filter((c) => !sameModel.includes(c) && !sameBody.includes(c) && Math.abs(c.price_rm - car.price_rm) <= car.price_rm * 0.2);
  return [...sameModel, ...sameBody, ...sameBand].slice(0, limit);
}

export type MakeFacet = { make: string; slug: string; count: number; models: { model: string; slug: string; count: number }[] };

export function makeFacets(cars: Car[]): MakeFacet[] {
  const map = new Map<string, MakeFacet>();
  for (const c of cars) {
    let m = map.get(c.makeSlug);
    if (!m) map.set(c.makeSlug, (m = { make: c.make, slug: c.makeSlug, count: 0, models: [] }));
    m.count++;
    let model = m.models.find((x) => x.slug === c.modelSlug);
    if (!model) m.models.push((model = { model: c.model, slug: c.modelSlug, count: 0 }));
    model.count++;
  }
  return [...map.values()]
    .map((m) => ({ ...m, models: m.models.sort((a, b) => b.count - a.count || a.model.localeCompare(b.model)) }))
    .sort((a, b) => b.count - a.count || a.make.localeCompare(b.make));
}

/** Compact shape sent to the browser for instant search. */
export type CarSummary = {
  code: string;
  slug: string;
  status: Car["status"];
  make: string;
  makeSlug: string;
  model: string;
  modelSlug: string;
  variant: string;
  year: number;
  body: Car["body_type"];
  price: number;
  monthly: number;
  mileage?: number;
  grade: string;
  transmission: string;
  fuel: string;
  colour: string;
  state: string;
  stateSlug: string;
  showroomId: string;
  cover?: string;
  featured: boolean;
  added: string;
};

export function toSummary(c: Car, s: Settings): CarSummary {
  return {
    code: c.code,
    slug: c.slug,
    status: c.status,
    make: c.make,
    makeSlug: c.makeSlug,
    model: c.model,
    modelSlug: c.modelSlug,
    variant: c.variant,
    year: c.year_manufactured,
    body: c.body_type,
    price: c.price_rm,
    monthly: Math.round(fromMonthly(c.price_rm, s)),
    mileage: c.mileage_km,
    grade: c.grade,
    transmission: c.transmission,
    fuel: c.fuel,
    colour: c.colour,
    state: c.stateName,
    stateSlug: c.stateSlug,
    showroomId: c.showroom_id,
    cover: c.photos[0],
    featured: c.featured,
    added: c.date_added ?? "",
  };
}

export const BUDGETS = [100, 150, 200, 250, 300, 400, 500] as const; // /cars/under-{n}k

export const MONTHLY_BANDS = [
  { label: "Under RM 1,500", max: 1500 },
  { label: "RM 1,500 – 2,500", min: 1500, max: 2500 },
  { label: "RM 2,500 – 4,000", min: 2500, max: 4000 },
  { label: "RM 4,000+", min: 4000 },
] as const;

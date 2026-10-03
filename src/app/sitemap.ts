import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { activeAgents, BUDGETS, listedStock, makeFacets } from "@/lib/data/queries";
import { BODY_TYPES } from "@/lib/data/constants";
import { CATEGORIES, getArticles } from "@/lib/guide";
import { STATES } from "@/lib/states";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [data, articles] = await Promise.all([getSiteData(), getArticles()]);
  const cars = listedStock(data).filter((c) => c.status !== "Sold"); // sold pages are noindex
  const u = (path: string, extra: Partial<MetadataRoute.Sitemap[number]> = {}) => ({ url: `${SITE_URL}${path}`, ...extra });
  const now = new Date();

  return [
    u("/", { changeFrequency: "daily", priority: 1, lastModified: now }),
    u("/cars", { changeFrequency: "hourly", priority: 0.9, lastModified: now }),
    ...cars.map((c) => u(`/cars/${c.slug}`, { changeFrequency: "daily", priority: 0.8, lastModified: c.date_added ? new Date(c.date_added) : now })),
    ...makeFacets(cars).flatMap((m) => [
      u(`/cars/${m.slug}`, { changeFrequency: "daily", priority: 0.7 }),
      ...m.models.map((mo) => u(`/cars/${m.slug}/${mo.slug}`, { changeFrequency: "daily", priority: 0.7 })),
    ]),
    ...BODY_TYPES.map((b) => u(`/cars/body/${b.toLowerCase()}`, { changeFrequency: "daily", priority: 0.6 })),
    ...BUDGETS.map((b) => u(`/cars/under-${b}k`, { changeFrequency: "daily", priority: 0.6 })),
    u("/showrooms", { changeFrequency: "weekly", priority: 0.6 }),
    ...STATES.map((s) => u(`/${s.slug}`, { changeFrequency: "weekly", priority: 0.6 })),
    ...activeAgents(data).map((a) => u(`/agent/${a.agent_id.toLowerCase()}`, { changeFrequency: "weekly", priority: 0.3 })),
    u("/guide", { changeFrequency: "weekly", priority: 0.7 }),
    ...CATEGORIES.map((c) => u(`/guide/category/${c.slug}`, { changeFrequency: "weekly", priority: 0.5 })),
    ...articles.map((a) => u(`/guide/${a.slug}`, { changeFrequency: "monthly", priority: 0.7, lastModified: new Date(a.updated ?? a.date) })),
    ...["/loan-calculator", "/find-me-a-car", "/private", "/why-us", "/become-an-agent", "/about", "/contact"].map((p) =>
      u(p, { changeFrequency: "monthly", priority: 0.5 }),
    ),
    ...["/privacy", "/terms"].map((p) => u(p, { changeFrequency: "yearly", priority: 0.1 })),
  ];
}

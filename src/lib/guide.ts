import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import { z } from "zod";
import type { Car } from "./data/types";

export const CATEGORIES = [
  { slug: "buying-basics", name: "Buying basics", blurb: "Recond vs used, auction sheets, inspections and paperwork." },
  { slug: "model-price-guides", name: "Model & price guides", blurb: "Harga recond for Malaysia's favourite models." },
  { slug: "costs-loans", name: "Costs & loans", blurb: "Hire purchase, salary needed, road tax and insurance." },
  { slug: "import-exotics", name: "Import & exotics", blurb: "Custom imports, AP, duties and supercars." },
] as const;
export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

const DIR = path.join(process.cwd(), "content", "guide");

const dateStr = z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v), z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
const lower = z.array(z.string()).default([]).transform((a) => a.map((s) => s.toLowerCase()));

const frontmatter = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum(CATEGORIES.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]]),
  date: dateStr,
  updated: dateStr.optional(),
  makes: lower,
  models: lower,
  body_types: lower,
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
});

export type ArticleMeta = z.infer<typeof frontmatter> & { slug: string; readingMinutes: number };
export type TocItem = { id: string; text: string; depth: 2 | 3 };
export type Article = ArticleMeta & { body: string; toc: TocItem[] };

function tocFrom(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const out: TocItem[] = [];
  let inCode = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) inCode = !inCode;
    const m = !inCode && line.match(/^(##|###)\s+(.+?)\s*#*$/);
    if (m) {
      const text = m[2].replace(/[*_`]/g, "").replace(/\[(.+?)\]\(.+?\)/g, "$1");
      out.push({ id: slugger.slug(text), text, depth: m[1].length as 2 | 3 });
    }
  }
  return out;
}

async function load(file: string): Promise<Article | null> {
  const raw = await readFile(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const parsed = frontmatter.safeParse(data);
  if (!parsed.success) {
    console.warn(`[guide] ${file} skipped: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    return null;
  }
  const words = content.split(/\s+/).length;
  return {
    ...parsed.data,
    slug: file.replace(/\.mdx?$/, ""),
    readingMinutes: Math.max(1, Math.round(words / 220)),
    body: content,
    toc: tocFrom(content),
  };
}

export const getArticles = cache(async (): Promise<Article[]> => {
  const files = (await readdir(DIR)).filter((f) => /\.mdx?$/.test(f));
  const all = (await Promise.all(files.map(load))).filter((a): a is Article => a !== null);
  return all.sort((a, b) => b.date.localeCompare(a.date));
});

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.slug === slug);
}

/** Stock embedded in an article: matches on model first, then make, then body type. */
export function matchStock(a: ArticleMeta, cars: Car[], limit = 4): Car[] {
  const score = (c: Car) =>
    (a.models.includes(c.modelSlug) ? 4 : 0) + (a.makes.includes(c.makeSlug) ? 2 : 0) + (a.body_types.includes(c.body_type.toLowerCase()) ? 1 : 0);
  return cars
    .filter((c) => c.status !== "Sold" && score(c) > 0)
    .sort((x, y) => score(y) - score(x))
    .slice(0, limit);
}

/** Articles relevant to a car page. */
export function articlesForCar(articles: ArticleMeta[], car: Car, limit = 3): ArticleMeta[] {
  const score = (a: ArticleMeta) =>
    (a.models.includes(car.modelSlug) ? 4 : 0) + (a.makes.includes(car.makeSlug) ? 2 : 0) + (a.body_types.includes(car.body_type.toLowerCase()) ? 1 : 0) + (a.category === "buying-basics" ? 0.5 : 0);
  return [...articles].sort((x, y) => score(y) - score(x)).slice(0, limit);
}

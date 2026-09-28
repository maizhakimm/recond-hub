import { slugify } from "./slug";

export type MyState = { slug: string; name: string; aliases: string[] };

/** All 13 states and 3 federal territories of Malaysia. */
export const STATES: MyState[] = [
  { slug: "johor", name: "Johor", aliases: ["jb", "johor bahru"] },
  { slug: "kedah", name: "Kedah", aliases: [] },
  { slug: "kelantan", name: "Kelantan", aliases: [] },
  { slug: "melaka", name: "Melaka", aliases: ["malacca"] },
  { slug: "negeri-sembilan", name: "Negeri Sembilan", aliases: ["n9", "ns", "negri sembilan"] },
  { slug: "pahang", name: "Pahang", aliases: [] },
  { slug: "penang", name: "Penang", aliases: ["pulau pinang", "pinang", "pg"] },
  { slug: "perak", name: "Perak", aliases: [] },
  { slug: "perlis", name: "Perlis", aliases: [] },
  { slug: "sabah", name: "Sabah", aliases: [] },
  { slug: "sarawak", name: "Sarawak", aliases: [] },
  { slug: "selangor", name: "Selangor", aliases: [] },
  { slug: "terengganu", name: "Terengganu", aliases: [] },
  { slug: "kuala-lumpur", name: "Kuala Lumpur", aliases: ["kl", "wp kuala lumpur", "wilayah persekutuan kuala lumpur"] },
  { slug: "putrajaya", name: "Putrajaya", aliases: ["wp putrajaya"] },
  { slug: "labuan", name: "Labuan", aliases: ["wp labuan"] },
];

const LOOKUP = new Map<string, MyState>();
for (const s of STATES) {
  LOOKUP.set(s.slug, s);
  LOOKUP.set(slugify(s.name), s);
  for (const a of s.aliases) LOOKUP.set(slugify(a), s);
}

/** Resolve free text from the sheet ("Pulau Pinang", "KL", "johor") to a known state. */
export function findState(value: string | undefined | null): MyState | undefined {
  if (!value) return undefined;
  return LOOKUP.get(slugify(value));
}

export const HQ = "HQ";

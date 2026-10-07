import { slugify } from "./slug";

export type MyState = { slug: string; name: string; aliases: string[] };

/** RecondHub target coverage: Peninsular Malaysia. Langkawi is not targeted separately. */
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
  { slug: "selangor", name: "Selangor", aliases: [] },
  { slug: "terengganu", name: "Terengganu", aliases: [] },
  { slug: "kuala-lumpur", name: "Kuala Lumpur", aliases: ["kl", "wp kuala lumpur", "wilayah persekutuan kuala lumpur"] },
  { slug: "putrajaya", name: "Putrajaya", aliases: ["wp putrajaya"] },
];

const LOOKUP = new Map<string, MyState>();
for (const s of STATES) {
  LOOKUP.set(s.slug, s);
  LOOKUP.set(slugify(s.name), s);
  for (const a of s.aliases) LOOKUP.set(slugify(a), s);
}

/** Resolve free text from the sheet ("Pulau Pinang", "KL", "johor") to a target coverage state. */
export function findState(value: string | undefined | null): MyState | undefined {
  if (!value) return undefined;
  return LOOKUP.get(slugify(value));
}

export const HQ = "HQ";

import Link from "next/link";
import { CATEGORIES, type ArticleMeta } from "@/lib/guide";

export function ArticleCard({ a }: { a: ArticleMeta }) {
  return (
    <Link href={`/guide/${a.slug}`} className="flex h-full flex-col rounded-xl border border-line bg-card p-5 hover:border-gold">
      <p className="eyebrow">{CATEGORIES.find((c) => c.slug === a.category)?.name}</p>
      <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight">{a.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-2">{a.description}</p>
      <p className="mt-3 text-xs text-muted">{a.readingMinutes} min read</p>
    </Link>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/guide/ArticleCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BRAND } from "@/lib/config";
import { CATEGORIES, getArticles } from "@/lib/guide";

export const metadata: Metadata = {
  title: "Recond Guide · Everything About Buying a Recond Car in Malaysia",
  description: `${BRAND}'s Recond Guide: auction sheets, recond vs used, harga guides, loans, road tax, insurance and importing exotics. Panduan kereta recond Malaysia.`,
  alternates: { canonical: "/guide" },
};

export default async function GuideIndex() {
  const articles = await getArticles();
  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Recond Guide", href: "/guide" },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">The Recond Guide</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-2">Malaysia&rsquo;s reference for buying a recond car: panduan lengkap from auction sheets to loans.</p>
      {CATEGORIES.map((c) => {
        const list = articles.filter((a) => a.category === c.slug);
        if (!list.length) return null;
        return (
          <section key={c.slug} className="mt-12" aria-labelledby={c.slug}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 id={c.slug} className="text-3xl">
                  {c.name}
                </h2>
                <p className="text-ink-2">{c.blurb}</p>
              </div>
              <Link href={`/guide/category/${c.slug}`} className="shrink-0 font-medium text-gold-text underline">
                View all
              </Link>
            </div>
            <ul className="grid gap-4 md:grid-cols-3">
              {list.slice(0, 3).map((a) => (
                <li key={a.slug}>
                  <ArticleCard a={a} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

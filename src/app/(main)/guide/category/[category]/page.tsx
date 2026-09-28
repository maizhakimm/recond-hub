import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/guide/ArticleCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CATEGORIES, getArticles } from "@/lib/guide";


export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = CATEGORIES.find((x) => x.slug === category);
  if (!c) return {};
  return { title: `${c.name} · Recond Guide`, description: c.blurb, alternates: { canonical: `/guide/category/${c.slug}` } };
}

export default async function CategoryPage({ params }: PageProps<"/guide/category/[category]">) {
  const { category } = await params;
  const c = CATEGORIES.find((x) => x.slug === category);
  if (!c) notFound();
  const list = (await getArticles()).filter((a) => a.category === c.slug);
  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Recond Guide", href: "/guide" },
          { name: c.name, href: `/guide/category/${c.slug}` },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">{c.name}</h1>
      <p className="mt-2 text-lg text-ink-2">{c.blurb}</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {list.map((a) => (
          <li key={a.slug}>
            <ArticleCard a={a} />
          </li>
        ))}
      </ul>
    </div>
  );
}

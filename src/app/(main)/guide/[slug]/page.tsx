import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { CarGrid } from "@/components/cars/CarCard";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";
import { ArticleCard } from "@/components/guide/ArticleCard";
import { Callout } from "@/components/guide/Callout";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND, SITE_URL } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listedStock, toSummary } from "@/lib/data/queries";
import { formatDateLong } from "@/lib/format";
import { CATEGORIES, getArticle, getArticles, matchStock } from "@/lib/guide";

export const revalidate = 300; // embedded stock stays fresh

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guide/[slug]">): Promise<Metadata> {
  const a = await getArticle((await params).slug);
  if (!a) return {};
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/guide/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.date, modifiedTime: a.updated ?? a.date },
  };
}

export default async function ArticlePage({ params }: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const [a, all, data] = await Promise.all([getArticle(slug), getArticles(), getSiteData()]);
  if (!a) notFound();
  const { content } = await compileMDX({
    source: a.body,
    components: { Callout },
    options: { mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } },
  });
  const stock = matchStock(a, listedStock(data)).map((c) => toSummary(c, data.settings));
  const category = CATEGORIES.find((c) => c.slug === a.category)!;
  const more = all.filter((x) => x.slug !== a.slug && (x.category === a.category || x.makes.some((m) => a.makes.includes(m)))).slice(0, 3);
  const url = `${SITE_URL}/guide/${a.slug}`;

  return (
    <div className="container-page py-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.description,
          datePublished: a.date,
          dateModified: a.updated ?? a.date,
          mainEntityOfPage: url,
          inLanguage: "en-MY",
          author: { "@type": "Organization", name: BRAND, url: SITE_URL },
          publisher: { "@type": "Organization", name: BRAND, url: SITE_URL },
        }}
      />
      {a.faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: a.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }}
        />
      )}
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Recond Guide", href: "/guide" },
          { name: category.name, href: `/guide/category/${category.slug}` },
          { name: a.title, href: `/guide/${a.slug}` },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="min-w-0">
          <header className="mb-6">
            <p className="eyebrow">{category.name}</p>
            <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">{a.title}</h1>
            <p className="mt-3 text-lg text-ink-2">{a.description}</p>
            <p className="mt-3 text-sm text-muted">
              {a.updated ? `Updated ${formatDateLong(a.updated)}` : formatDateLong(a.date)} · {a.readingMinutes} min read
            </p>
          </header>

          {a.toc.length > 2 && (
            <details className="mb-6 rounded-xl border border-line bg-card p-4 lg:hidden">
              <summary className="min-h-8 cursor-pointer font-semibold">On this page</summary>
              <Toc items={a.toc} />
            </details>
          )}

          <div className="prose prose-stone max-w-none prose-headings:scroll-mt-20 prose-headings:prose-h2:text-3xl prose-a:text-gold-text prose-table:text-sm prose-th:text-left">
            {content}
          </div>

          {stock.length > 0 && (
            <section className="mt-12" aria-labelledby="in-stock">
              <h2 id="in-stock" className="mb-4 text-3xl">
                In stock now
              </h2>
              <CarGrid cars={stock} />
            </section>
          )}

          {a.faqs.length > 0 && (
            <section className="mt-12" aria-labelledby="faq">
              <h2 id="faq" className="mb-4 text-3xl">
                Frequently asked questions
              </h2>
              <div className="divide-y divide-line rounded-xl border border-line bg-card">
                {a.faqs.map((f) => (
                  <details key={f.q} className="group p-4">
                    <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <span className="text-gold transition group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-ink-2">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {a.cta === "private" ? (
            <section className="mt-12 rounded-2xl bg-night p-6 text-[#f1ead9] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">Private Sourcing</p>
              <h2 className="mt-2 text-3xl text-[#f7f1e3]">Looking for something rare?</h2>
              <p className="mt-2 text-[#b9ae98]">Your request goes straight to our owner.</p>
              <Link href="/private#request" className="btn mt-4 border border-champagne text-champagne hover:bg-champagne hover:text-night">
                Make a private request
              </Link>
            </section>
          ) : (
            <section className="mt-12 rounded-2xl bg-ink p-6 text-paper sm:p-8">
              <h2 className="text-3xl text-paper">Questions? Ask a recond specialist.</h2>
              <p className="mt-2 text-[#c5cad3]">We reply on WhatsApp, usually within minutes during showroom hours.</p>
              <WhatsAppButton className="btn btn-wa mt-4" label="Ask on WhatsApp" message={`Hi, I read "${a.title}" and have a question.`} />
            </section>
          )}
        </article>

        {a.toc.length > 2 && (
          <aside className="hidden lg:block" aria-label="Table of contents">
            <div className="sticky top-20">
              <p className="font-semibold">On this page</p>
              <Toc items={a.toc} />
            </div>
          </aside>
        )}
      </div>

      {more.length > 0 && (
        <section className="mt-16" aria-labelledby="more">
          <h2 id="more" className="mb-4 text-3xl">
            Keep reading
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {more.map((m) => (
              <li key={m.slug}>
                <ArticleCard a={m} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Toc({ items }: { items: { id: string; text: string; depth: 2 | 3 }[] }) {
  return (
    <ol className="mt-2 space-y-1 text-sm">
      {items.map((t) => (
        <li key={t.id} className={t.depth === 3 ? "pl-4" : ""}>
          <a href={`#${t.id}`} className="inline-flex min-h-8 items-center text-ink-2 hover:text-ink hover:underline">
            {t.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

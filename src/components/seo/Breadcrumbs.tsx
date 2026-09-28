import Link from "next/link";
import { SITE_URL } from "@/lib/config";
import { JsonLd } from "./JsonLd";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={`mb-4 text-sm ${dark ? "text-[#b9ae98]" : "text-muted"}`}>
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page">{c.name}</span>
              ) : (
                <Link href={c.href} className="inline-flex min-h-8 items-center hover:underline">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${SITE_URL}${c.href}` })),
        }}
      />
    </>
  );
}

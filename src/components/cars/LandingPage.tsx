import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/seo/Breadcrumbs";
import { Explorer } from "./Explorer";
import { explorerProps } from "@/lib/data/explorer";
import type { Car, SiteData } from "@/lib/data/types";
import type { Filters } from "@/lib/filters";
import { formatRM } from "@/lib/format";

/** Shared layout for SEO landing pages: /cars/toyota, /cars/toyota/alphard, /cars/body/mpv, /cars/under-200k. */
export function LandingPage({
  data,
  cars,
  title,
  intro,
  crumbs,
  locked,
  related = [],
  children,
}: {
  data: SiteData;
  cars: Car[];
  title: string;
  intro: string;
  crumbs: Crumb[];
  locked: Partial<Filters>;
  related?: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  const prices = cars.filter((c) => c.status !== "Sold").map((c) => c.price_rm);
  return (
    <div className="container-page py-6">
      <Breadcrumbs items={crumbs} />
      <header className="mb-6">
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-ink-2">{intro}</p>
        {prices.length > 0 && (
          <p className="mt-2 text-sm text-muted tnum">
            {prices.length} in stock · harga from {formatRM(Math.min(...prices))} to {formatRM(Math.max(...prices))}
          </p>
        )}
        {related.length > 0 && (
          <ul className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
            {related.map((r) => (
              <li key={r.href} className="shrink-0">
                <Link href={r.href} className="chip">
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>
      <Explorer {...explorerProps(data, cars)} locked={locked} />
      {children && <section className="prose prose-stone mt-12 max-w-3xl">{children}</section>}
    </div>
  );
}

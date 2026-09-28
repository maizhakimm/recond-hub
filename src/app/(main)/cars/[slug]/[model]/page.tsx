import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/cars/LandingPage";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listedStock, makeFacets } from "@/lib/data/queries";
import type { SiteData } from "@/lib/data/types";
import { getArticles } from "@/lib/guide";

export const revalidate = 300;

export async function generateStaticParams() {
  const data = await getSiteData();
  return makeFacets(listedStock(data)).flatMap((m) => m.models.map((mo) => ({ slug: m.slug, model: mo.slug })));
}

function resolve(data: SiteData, make: string, model: string) {
  const cars = listedStock(data).filter((c) => c.makeSlug === make && c.modelSlug === model);
  const any = cars[0] ?? data.stock.find((c) => c.makeSlug === make && c.modelSlug === model && c.status !== "Hidden");
  return { cars, any };
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]/[model]">): Promise<Metadata> {
  const { slug, model } = await params;
  const { cars, any } = resolve(await getSiteData(), slug, model);
  if (!any) return {};
  const name = `${any.make} ${any.model}`;
  return {
    title: `${name} Recond for Sale · Harga ${name} Recond Malaysia`,
    description: `${cars.length} ${name} recond in stock at ${BRAND}. Compare variants, auction grades, mileage and harga, then book a viewing at a showroom near you.`,
    alternates: { canonical: `/cars/${slug}/${model}` },
  };
}

export default async function ModelPage({ params }: PageProps<"/cars/[slug]/[model]">) {
  const [{ slug, model }, data, articles] = await Promise.all([params, getSiteData(), getArticles()]);
  const { cars, any } = resolve(data, slug, model);
  if (!any) notFound();
  const name = `${any.make} ${any.model}`;
  const guide = articles.find((a) => a.models.includes(model));
  const siblings = makeFacets(listedStock(data).filter((c) => c.makeSlug === slug))[0]?.models.filter((m) => m.slug !== model) ?? [];
  return (
    <LandingPage
      data={data}
      cars={cars}
      title={`${name} recond for sale`}
      intro={`Every ${name} recond we have right now, from all our showrooms and partner APs. Prices, grades and mileage are updated daily.${cars.length ? "" : " None in stock today: tell us your spec and we will source one."}`}
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Cars", href: "/cars" },
        { name: any.make, href: `/cars/${slug}` },
        { name: any.model, href: `/cars/${slug}/${model}` },
      ]}
      locked={{ make: slug, model }}
      related={[{ href: `/cars/${slug}`, label: `All ${any.make}` }, ...siblings.map((m) => ({ href: `/cars/${slug}/${m.slug}`, label: `${any.make} ${m.model}` }))]}
    >
      {guide ? (
        <p>
          Planning to buy? Read our <Link href={`/guide/${guide.slug}`}>{guide.title}</Link>.
        </p>
      ) : null}
    </LandingPage>
  );
}

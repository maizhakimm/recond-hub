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
    description: `Browse ${name} recond listings at ${BRAND}. Compare available variants, prices, mileage and vehicle details, then enquire with our team via WhatsApp.`,
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
      intro={`Browse the ${name} recond listings currently available on RecondHub. Compare prices, variants, mileage and vehicle information where provided.${cars.length ? "" : " None are listed today: tell us your preferred specification and we can help with a sourcing enquiry."}`}
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
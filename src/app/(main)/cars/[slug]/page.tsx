import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CarDetail, absoluteUrl } from "@/components/cars/CarDetail";
import { LandingPage } from "@/components/cars/LandingPage";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { BUDGETS, carPageState, findCarBySlug, listedStock, makeFacets } from "@/lib/data/queries";
import type { SiteData } from "@/lib/data/types";
import { formatRM } from "@/lib/format";
import { articlesForCar, getArticles } from "@/lib/guide";

export const revalidate = 300;

type Kind = { kind: "car"; slug: string } | { kind: "budget"; max: number } | { kind: "make"; slug: string };
const CAR_SLUG = /^[a-z]{1,5}\d{1,6}-/;

function classify(slug: string): Kind {
  const budget = slug.match(/^under-(\d{2,4})k$/);
  if (budget) return { kind: "budget", max: Number(budget[1]) * 1000 };
  if (CAR_SLUG.test(slug)) return { kind: "car", slug };
  return { kind: "make", slug };
}

export async function generateStaticParams() {
  const data = await getSiteData();
  const listed = listedStock(data);
  return [...listed.map((c) => ({ slug: c.slug })), ...makeFacets(listed).map((m) => ({ slug: m.slug })), ...BUDGETS.map((b) => ({ slug: `under-${b}k` }))];
}

function makeCars(data: SiteData, slug: string) {
  return listedStock(data).filter((c) => c.makeSlug === slug);
}

export async function generateMetadata({ params }: PageProps<"/cars/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSiteData();
  const k = classify(slug);
  if (k.kind === "car") {
    const car = findCarBySlug(data, slug);
    if (!car || carPageState(car) === "gone") return {};
    const sold = car.status === "Sold";
    const title = `${car.year_manufactured} ${car.title} Recond · ${sold ? "Sold" : formatRM(car.price_rm)} · ${BRAND}`;
    const details = [car.grade ? `auction grade ${car.grade}` : null, car.mileage_km !== undefined ? `${car.mileage_km.toLocaleString("en-MY")} km` : null].filter(Boolean).join(", ");
    const description = sold
      ? `This ${car.year_manufactured} ${car.make} ${car.model} has been sold. Browse similar ${car.model} recond listings or send a sourcing enquiry to ${BRAND}.`
      : `${car.year_manufactured} ${car.title} recond${details ? `, ${details}` : ""}, listed at ${formatRM(car.price_rm)}. View vehicle details, available documents and enquire via WhatsApp.`;
    const image = car.photos[0] ? absoluteUrl(car.photos[0]) : undefined;
    return {
      title: { absolute: title }, description, alternates: { canonical: `/cars/${car.slug}` },
      openGraph: { title, description, url: `/cars/${car.slug}`, images: image ? [{ url: image, alt: `${car.year_manufactured} ${car.make} ${car.model} ${car.colour}` }] : undefined },
      twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
      robots: sold ? { index: false, follow: true } : undefined,
    };
  }
  if (k.kind === "budget") {
    const title = `Recond Cars Under RM${k.max / 1000}k in Malaysia · Kereta Recond Bawah RM${k.max / 1000}k`;
    return { title, description: `Browse recond car listings priced up to RM${(k.max / 1000).toFixed(0)},000 on ${BRAND}. Compare vehicle details and estimated monthly instalments, then enquire via WhatsApp.`, alternates: { canonical: `/cars/${slug}` } };
  }
  const cars = makeCars(data, slug);
  if (!cars.length) return {};
  const make = cars[0].make;
  return { title: `${make} Recond for Sale in Malaysia · Harga ${make} Recond`, description: `Browse ${make} recond listings on ${BRAND}. Compare available models, prices, mileage, vehicle details and estimated monthly instalments.`, alternates: { canonical: `/cars/${slug}` } };
}

export default async function CarsSlugPage({ params }: PageProps<"/cars/[slug]">) {
  const [{ slug }, data] = await Promise.all([params, getSiteData()]);
  const k = classify(slug);
  if (k.kind === "car") {
    const car = findCarBySlug(data, slug);
    const state = carPageState(car);
    if (state === "gone" || !car) notFound();
    if (state === "redirect") permanentRedirect(`/cars/${car.makeSlug}/${car.modelSlug}`);
    if (slug !== car.slug) permanentRedirect(`/cars/${car.slug}`);
    const articles = articlesForCar(await getArticles(), car);
    return <CarDetail data={data} car={car} articles={articles} />;
  }
  if (k.kind === "budget") {
    const cars = listedStock(data).filter((c) => c.price_rm <= k.max);
    return <LandingPage data={data} cars={cars} title={`Recond cars under RM${k.max / 1000}k`} intro={`Kereta recond bawah RM${(k.max / 1000).toFixed(0)}k: browse current listings at or below ${formatRM(k.max)}. Monthly instalments are estimates based on ${data.settings.minDownpaymentPct}% down and ${data.settings.maxTenureYears} years and remain subject to financing approval.`} crumbs={[{ name: "Home", href: "/" },{ name: "Cars", href: "/cars" },{ name: `Under RM${k.max / 1000}k`, href: `/cars/${slug}` }]} locked={{ pmax: k.max }} related={BUDGETS.filter((b) => b * 1000 !== k.max).map((b) => ({ href: `/cars/under-${b}k`, label: `Under RM${b}k` }))} />;
  }
  const cars = makeCars(data, k.slug);
  if (!cars.length) {
    const any = data.stock.find((c) => c.makeSlug === k.slug && c.status !== "Hidden");
    if (!any) notFound();
  }
  const make = cars[0]?.make ?? data.stock.find((c) => c.makeSlug === k.slug)!.make;
  const facet = makeFacets(cars)[0];
  return <LandingPage data={data} cars={cars} title={`${make} recond for sale`} intro={`Browse current ${make} recond listings on ${BRAND}. Compare models, prices, mileage and vehicle information where available, then enquire with our team.`} crumbs={[{ name: "Home", href: "/" },{ name: "Cars", href: "/cars" },{ name: make, href: `/cars/${k.slug}` }]} locked={{ make: k.slug }} related={(facet?.models ?? []).map((m) => ({ href: `/cars/${k.slug}/${m.slug}`, label: `${make} ${m.model} (${m.count})` }))} />;
}

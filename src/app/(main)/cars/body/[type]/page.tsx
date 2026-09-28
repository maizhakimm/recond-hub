import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingPage } from "@/components/cars/LandingPage";
import { BRAND } from "@/lib/config";
import { getSiteData } from "@/lib/data";
import { listedStock } from "@/lib/data/queries";
import { BODY_TYPES } from "@/lib/data/schema";

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return BODY_TYPES.map((b) => ({ type: b.toLowerCase() }));
}

const COPY: Record<string, string> = {
  mpv: "Recond MPVs for big families and business: Alphard, Vellfire, Serena, Stepwgn and more.",
  suv: "Recond SUVs from Harrier and CX-8 to Macan and NX, with auction grades you can check.",
  sedan: "Recond sedans from Japan and the UK: BMW, Mercedes-Benz, Lexus, Toyota and more.",
  hatchback: "Fun, easy-to-park recond hatchbacks, from Mini to Civic Type R.",
  coupe: "Weekend recond coupes and sports cars: GR86, BRZ, Supra and friends.",
  pickup: "Rare JDM and UK pickups: Hilux GR Sport and other recond 4x4s.",
};

function bodyName(type: string) {
  return BODY_TYPES.find((b) => b.toLowerCase() === type);
}

export async function generateMetadata({ params }: PageProps<"/cars/body/[type]">): Promise<Metadata> {
  const { type } = await params;
  const name = bodyName(type);
  if (!name) return {};
  return {
    title: `Recond ${name} for Sale in Malaysia · ${name} Recond Harga`,
    description: `${COPY[type]} Browse every recond ${name} in ${BRAND} stock with monthly instalments and showrooms near you.`,
    alternates: { canonical: `/cars/body/${type}` },
  };
}

export default async function BodyPage({ params }: PageProps<"/cars/body/[type]">) {
  const [{ type }, data] = await Promise.all([params, getSiteData()]);
  const name = bodyName(type);
  if (!name) notFound();
  const cars = listedStock(data).filter((c) => c.body_type === name);
  return (
    <LandingPage
      data={data}
      cars={cars}
      title={`Recond ${name} for sale`}
      intro={COPY[type]}
      crumbs={[
        { name: "Home", href: "/" },
        { name: "Cars", href: "/cars" },
        { name: name, href: `/cars/body/${type}` },
      ]}
      locked={{ body: type }}
      related={BODY_TYPES.filter((b) => b !== name).map((b) => ({ href: `/cars/body/${b.toLowerCase()}`, label: `Recond ${b}` }))}
    />
  );
}

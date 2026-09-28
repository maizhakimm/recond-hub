import type { Metadata } from "next";
import { Explorer } from "@/components/cars/Explorer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getSiteData } from "@/lib/data";
import { explorerProps } from "@/lib/data/explorer";
import { listedStock } from "@/lib/data/queries";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  title: "Recond Cars for Sale in Malaysia · Harga Kereta Recond Terkini",
  description: `Search every recond car in ${BRAND} stock: Alphard, Vellfire, Harrier, BMW, Mercedes and more. Filter by price, monthly instalment, state and auction grade. Updated daily.`,
  alternates: { canonical: "/cars" },
};

export const revalidate = 300;

export default async function CarsPage() {
  const data = await getSiteData();
  const cars = listedStock(data);
  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Cars for sale", href: "/cars" }]} />
      <header className="mb-6">
        <h1 className="text-4xl sm:text-5xl">Recond cars for sale</h1>
        <p className="mt-2 max-w-2xl text-ink-2">
          {cars.length} kereta recond in stock across Malaysia, updated daily from our showrooms and partner APs. Every car comes with its Japanese auction
          sheet.
        </p>
      </header>
      <Explorer {...explorerProps(data, cars)} />
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Pixels } from "@/components/analytics/Pixels";
import { SiteProvider } from "@/components/site/SiteProvider";
import { getSiteData } from "@/lib/data";
import { BRAND, BRAND_TAGLINE, SITE_URL } from "@/lib/config";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} · Kereta Recond Malaysia · Alphard, Vellfire, Harrier & more`,
    template: `%s · ${BRAND}`,
  },
  description: `${BRAND} (${BRAND_TAGLINE}) sells auction-sheet verified recond cars across Malaysia. Search harga kereta recond, book a viewing at 10+ showrooms and WhatsApp an agent in your state.`,
  openGraph: { siteName: BRAND, type: "website", locale: "en_MY" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { settings } = await getSiteData();
  return (
    <html lang="en-MY" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">
        <SiteProvider settings={settings}>{children}</SiteProvider>
        <Pixels />
      </body>
    </html>
  );
}

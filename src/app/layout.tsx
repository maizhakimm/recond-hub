import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Pixels } from "@/components/analytics/Pixels";
import { SiteProvider } from "@/components/site/SiteProvider";
import { getSiteData } from "@/lib/data";
import { BRAND, SITE_URL } from "@/lib/config";
import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-cormorant", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const description = "Browse reconditioned cars in Malaysia with RecondHub. Explore available stock, compare vehicle details and monthly estimates, or enquire via WhatsApp. Klang Valley based, serving buyers across Peninsular Malaysia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} | Recond Cars Malaysia`,
    template: `%s | ${BRAND}`,
  },
  description,
  keywords: ["recond car Malaysia", "kereta recond", "reconditioned cars Malaysia", "Toyota Alphard recond", "Toyota Vellfire recond", "Toyota Harrier recond", "RecondHub"],
  applicationName: BRAND,
  category: "automotive",
  openGraph: {
    title: `${BRAND} | Recond Cars Malaysia`,
    description,
    siteName: BRAND,
    type: "website",
    locale: "en_MY",
    url: SITE_URL,
    images: [{ url: "/photos/recondhub-og-image.png", width: 1200, height: 630, alt: `${BRAND} - Recond Cars Malaysia` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} | Recond Cars Malaysia`,
    description,
    images: ["/photos/recondhub-og-image.png"],
  },
  icons: {
    icon: [{ url: "/photos/recondhub-favicon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/photos/recondhub-favicon.png", sizes: "512x512", type: "image/png" }],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { settings } = await getSiteData();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: BRAND,
        url: SITE_URL,
        logo: `${SITE_URL}/photos/recondhub-favicon.png`,
        description,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND,
        description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en-MY", "ms-MY"],
      },
    ],
  };
  return (
    <html lang="en-MY" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <SiteProvider settings={settings}>{children}</SiteProvider>
        <Pixels />
      </body>
    </html>
  );
}

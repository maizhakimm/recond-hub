/** Brand and site-wide constants. Change NEXT_PUBLIC_BRAND_NAME once the final name is picked. */
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "RecondHub";
export const BRAND_TAGLINE = "King of Recond";
/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL (e.g. https://recondhub.com.my) once the domain is live;
 * until then Vercel's production URL is used, so canonical links and the sitemap always point somewhere real.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

/** ISR window for every page that reads the Google Sheet. */
export const REVALIDATE_SECONDS = 300;
export const SHEETS_CACHE_TAG = "sheets";

/** Sold cars: listed with a badge for this many days, detail page kept for SOLD_PAGE_DAYS, then 301. */
export const SOLD_LISTED_DAYS = 7;
export const SOLD_PAGE_DAYS = 30;

export const REF_COOKIE = "rh_ref";
export const UTM_COOKIE = "rh_utm";
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const SOCIAL = {
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://www.tiktok.com/@farishafie313",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
};

export const LEGAL_NAME = process.env.NEXT_PUBLIC_LEGAL_NAME || BRAND;
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@recondhub.com.my";

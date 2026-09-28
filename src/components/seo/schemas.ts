import { BRAND, SITE_URL } from "@/lib/config";
import type { Showroom } from "@/lib/data/types";
import { parseOpeningHours } from "@/lib/hours";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** AutoDealer (a LocalBusiness subtype) for one showroom. */
export function showroomJsonLd(s: Showroom) {
  const week = parseOpeningHours(s.opening_hours);
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${SITE_URL}/showrooms#${s.showroom_id}`,
    name: s.name,
    brand: BRAND,
    url: `${SITE_URL}/${s.stateSlug}`,
    telephone: `+${s.whatsapp}`,
    image: s.photo ? (s.photo.startsWith("/") ? `${SITE_URL}${s.photo}` : s.photo) : undefined,
    hasMap: s.google_maps_url || undefined,
    address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: s.city, addressRegion: s.stateName, addressCountry: "MY" },
    openingHoursSpecification: week
      .map((h, d) => (h ? { "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES[d], opens: hhmm(h.open), closes: hhmm(h.close) } : null))
      .filter(Boolean),
  };
}

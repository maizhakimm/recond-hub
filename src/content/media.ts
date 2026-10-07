/**
 * Marketing media that is not stock: customer deliveries, TikTok videos and Private Sourcing deliveries.
 * Edit these lists in the repo (they change rarely). Images can be /public paths or HTTPS URLs.
 * The /photos/* images are Wikimedia Commons demo photos (see /credits); replace them with your own before launch.
 */
export type Delivery = { image: string; caption: string };
export type TikTokVideo = { id: string; url: string; caption: string };
export type PrivateDelivery = { image: string; title: string; note: string };

export const DELIVERIES: Delivery[] = [
  { image: "/photos/alphard.jpg", caption: "Alphard SC · Johor Bahru" },
  { image: "/photos/harrier.jpg", caption: "Harrier Z Leather · Shah Alam" },
  { image: "/photos/vellfire.jpg", caption: "Vellfire ZG · Penang" },
  { image: "/photos/civic-type-r.jpg", caption: "Civic Type R · Kuala Lumpur" },
];

export const TIKTOK_VIDEOS: TikTokVideo[] = [
  { id: "7540568899503295762", url: "https://www.tiktok.com/@farishafie313/video/7540568899503295762", caption: "Watch on TikTok" },
  { id: "7624360484313042183", url: "https://www.tiktok.com/@farishafie313/video/7624360484313042183", caption: "Watch on TikTok" },
  { id: "7540893430029847816", url: "https://www.tiktok.com/@farishafie313/video/7540893430029847816", caption: "Watch on TikTok" },
];

export const PRIVATE_DELIVERIES: PrivateDelivery[] = [
  { image: "/photos/bugatti-chiron.jpg", title: "Bugatti Chiron Sport", note: "Carbon & Italian Red · Kuala Lumpur" },
  { image: "/photos/laferrari.jpg", title: "Ferrari LaFerrari", note: "Rosso Corsa · Selangor" },
  { image: "/photos/lambo-revuelto.jpg", title: "Lamborghini Revuelto", note: "Bianco Monocerus · Johor" },
  { image: "/photos/mclaren-p1.jpg", title: "McLaren P1", note: "Supernova Silver · Penang" },
  { image: "/photos/ferrari-sf90.jpg", title: "Ferrari SF90 Stradale", note: "Giallo Modena · Kuala Lumpur" },
  { image: "/photos/lambo-aventador.jpg", title: "Lamborghini Aventador SVJ Roadster", note: "Bronzo · Selangor" },
  { image: "/photos/ferrari-296.jpg", title: "Ferrari 296 GTB", note: "Rosso Imola · Kuala Lumpur" },
  { image: "/photos/urus.jpg", title: "Lamborghini Urus Performante", note: "Verde Mantis · Johor" },
];

/** Optional full-screen hero video for /private (MP4 URL, muted autoplay). Leave empty to use PRIVATE_HERO_IMAGE. */
export const PRIVATE_HERO_VIDEO = "";
export const PRIVATE_HERO_IMAGE = "/photos/bugatti-divo.jpg";

/** Real customer reviews only. Leave empty until you have them; the section hides itself. */
export type Review = { name: string; car: string; text: string; source?: string };
export const REVIEWS: Review[] = [];

/** Banks you actually have financing arrangements with. The section hides itself when empty. */
export const FINANCING_PARTNERS: string[] = [];

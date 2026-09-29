/**
 * Marketing media that is not stock: customer deliveries, TikTok videos and Private Sourcing deliveries.
 * Edit these lists in the repo (they change rarely). Images can be /public paths or HTTPS URLs.
 * The /photos/* images are Wikimedia Commons demo photos (see /credits); replace them with your own before launch.
 * TikTok: paste the numeric video id from https://www.tiktok.com/@user/video/<id>. Leave id empty to link to the profile.
 */
export type Delivery = { image: string; caption: string };
export type TikTokVideo = { id?: string; caption: string };
export type PrivateDelivery = { image: string; title: string; note: string };

export const DELIVERIES: Delivery[] = [
  { image: "/photos/alphard.jpg", caption: "Alphard SC · Johor Bahru" },
  { image: "/photos/harrier.jpg", caption: "Harrier Z Leather · Shah Alam" },
  { image: "/photos/vellfire.jpg", caption: "Vellfire ZG · Penang" },
  { image: "/photos/civic-type-r.jpg", caption: "Civic Type R · Kuala Lumpur" },
];

export const TIKTOK_VIDEOS: TikTokVideo[] = [
  { caption: "Alphard SC vs Vellfire ZG: which one?" },
  { caption: "How to read an auction sheet in 60 seconds" },
  { caption: "Delivery day: Harrier to Johor" },
];

export const PRIVATE_DELIVERIES: PrivateDelivery[] = [
  { image: "/photos/ferrari-296.jpg", title: "Ferrari 296 GTB", note: "Rosso Imola · Kuala Lumpur" },
  { image: "/photos/urus.jpg", title: "Lamborghini Urus Performante", note: "Verde Mantis · Johor" },
  { image: "/photos/mclaren.jpg", title: "McLaren 750S", note: "Volcano Orange · Penang" },
  { image: "/photos/gt3rs.jpg", title: "Porsche 911 GT3 RS", note: "Weissach package · Selangor" },
];

/** Optional full-screen hero video for /private (MP4 URL, muted autoplay). Leave empty to use PRIVATE_HERO_IMAGE. */
export const PRIVATE_HERO_VIDEO = "";
export const PRIVATE_HERO_IMAGE = "/photos/ferrari-296.jpg";

/** Real customer reviews only. Leave empty until you have them; the section hides itself. */
export type Review = { name: string; car: string; text: string; source?: string };
export const REVIEWS: Review[] = [];

/** Banks you actually have financing arrangements with. The section hides itself when empty. */
export const FINANCING_PARTNERS: string[] = [];

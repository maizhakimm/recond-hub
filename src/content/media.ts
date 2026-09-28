/**
 * Marketing media that is not stock: customer deliveries, TikTok videos and Private Sourcing deliveries.
 * Edit these lists in the repo (they change rarely). Images can be /public paths or HTTPS URLs.
 * TikTok: paste the numeric video id from https://www.tiktok.com/@user/video/<id>. Leave id empty to link to the profile.
 */
export type Delivery = { image: string; caption: string };
export type TikTokVideo = { id?: string; caption: string };
export type PrivateDelivery = { image: string; title: string; note: string };

export const DELIVERIES: Delivery[] = [
  { image: "/sample/delivery.svg", caption: "Alphard SC · Johor Bahru" },
  { image: "/sample/delivery.svg", caption: "Harrier Z Leather · Shah Alam" },
  { image: "/sample/delivery.svg", caption: "Vellfire ZG · Penang" },
  { image: "/sample/delivery.svg", caption: "Civic Type R · Kuala Lumpur" },
];

export const TIKTOK_VIDEOS: TikTokVideo[] = [
  { caption: "Alphard SC vs Vellfire ZG: which one?" },
  { caption: "How to read an auction sheet in 60 seconds" },
  { caption: "Delivery day: Harrier to Johor" },
];

export const PRIVATE_DELIVERIES: PrivateDelivery[] = [
  { image: "/sample/exotic.svg", title: "Ferrari 296 GTB", note: "Rosso Imola · Kuala Lumpur" },
  { image: "/sample/exotic.svg", title: "Lamborghini Urus Performante", note: "Verde Mantis · Johor" },
  { image: "/sample/exotic.svg", title: "McLaren 750S", note: "Volcano Orange · Penang" },
  { image: "/sample/exotic.svg", title: "Porsche 911 GT3 RS", note: "Weissach package · Selangor" },
];

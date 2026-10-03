/** Plain constants shared by server and browser code. Kept out of schema.ts so zod never ships to the browser. */
export const STATUSES = ["Available", "Reserved", "Sold", "Hidden"] as const;
export const BODY_TYPES = ["MPV", "SUV", "Sedan", "Hatchback", "Coupe", "Pickup"] as const;
export type BodyType = (typeof BODY_TYPES)[number];

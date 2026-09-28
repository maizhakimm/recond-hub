"use client";

export type TrackEvent =
  | "search"
  | "filter_apply"
  | "view_car"
  | "click_whatsapp"
  | "open_booking"
  | "submit_booking"
  | "use_calculator"
  | "submit_loan_check"
  | "submit_trade_in"
  | "submit_find_me_a_car"
  | "submit_private_sourcing"
  | "submit_agent_application";

export type TrackParams = { car_code?: string; state?: string; agent?: string } & Record<string, string | number | undefined>;

type Fn = (...args: unknown[]) => void;
declare global {
  interface Window {
    gtag?: Fn;
    fbq?: Fn;
    ttq?: { track: Fn; page: Fn };
  }
}

/** Standard Meta / TikTok events fired alongside the custom event so ad optimisation works. */
const META_STANDARD: Partial<Record<TrackEvent, string>> = {
  search: "Search",
  view_car: "ViewContent",
  click_whatsapp: "Contact",
  submit_booking: "Schedule",
  submit_loan_check: "Lead",
  submit_trade_in: "Lead",
  submit_find_me_a_car: "Lead",
  submit_private_sourcing: "Lead",
  submit_agent_application: "SubmitApplication",
};
const TIKTOK_STANDARD: Partial<Record<TrackEvent, string>> = {
  search: "Search",
  view_car: "ViewContent",
  click_whatsapp: "Contact",
  submit_booking: "SubmitForm",
  submit_loan_check: "SubmitForm",
  submit_trade_in: "SubmitForm",
  submit_find_me_a_car: "SubmitForm",
  submit_private_sourcing: "SubmitForm",
  submit_agent_application: "SubmitForm",
};

export function track(event: TrackEvent, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  try {
    window.gtag?.("event", event, clean);
    window.fbq?.("trackCustom", event, clean);
    if (META_STANDARD[event]) window.fbq?.("track", META_STANDARD[event], clean);
    window.ttq?.track(TIKTOK_STANDARD[event] ?? event, clean);
  } catch {
    // analytics must never break the page
  }
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, clean);
}

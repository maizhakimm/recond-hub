"use client";

import { waLink } from "../whatsapp";
import type { LeadInput, LeadResponse } from "./types";

export type LeadPayload = Partial<Omit<LeadInput, "details">> & Pick<LeadInput, "type"> & { details?: LeadInput["details"] };

const UTM_KEY = "rh_utm";

/** Keep first-touch UTM params for the session (the proxy also stores them in a cookie). */
export function rememberUtm(): void {
  try {
    const p = new URLSearchParams(window.location.search);
    const src = p.get("utm_source");
    if (src && !sessionStorage.getItem(UTM_KEY)) {
      sessionStorage.setItem(UTM_KEY, JSON.stringify({ utm_source: src, utm_campaign: p.get("utm_campaign") ?? "" }));
    }
  } catch {
    // storage may be blocked
  }
}

function storedUtm(): { utm_source?: string; utm_campaign?: string } {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}

function isTouch(): boolean {
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}

/**
 * Log the lead (server routes it and appends to the Leads sheet), then open WhatsApp to the routed number.
 * On desktop a tab is opened synchronously so popup blockers allow it; on phones we navigate so the app opens.
 * If the API fails, WhatsApp still opens to the fallback (HQ) number: a lead is never lost at the last step.
 */
export async function submitLead(
  payload: LeadPayload,
  buildMessage: string | ((routed: { whatsapp: string; assigned_to: string }) => string),
  fallbackWhatsapp: string,
): Promise<{ whatsapp: string; assigned_to: string }> {
  const win = isTouch() ? null : window.open("", "_blank");
  let routed = { whatsapp: fallbackWhatsapp, assigned_to: "" };
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_page: window.location.href, ...storedUtm(), ...payload }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const json = (await res.json()) as LeadResponse;
    if (json.ok && json.whatsapp) routed = { whatsapp: json.whatsapp, assigned_to: json.assigned_to };
  } catch {
    // fall through to fallback number
  }
  const message = typeof buildMessage === "function" ? buildMessage(routed) : buildMessage;
  const url = waLink(routed.whatsapp, message);
  if (win) {
    win.opener = null;
    win.location.href = url;
  } else {
    window.location.href = url;
  }
  return routed;
}

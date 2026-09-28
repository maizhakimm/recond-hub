"use client";

import { createContext, useContext, useEffect } from "react";
import type { Settings } from "@/lib/data/types";
import { rememberUtm } from "@/lib/leads/client";

const SiteContext = createContext<Settings | null>(null);

export function SiteProvider({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  useEffect(() => rememberUtm(), []);
  return <SiteContext.Provider value={settings}>{children}</SiteContext.Provider>;
}

export function useSettings(): Settings {
  const s = useContext(SiteContext);
  if (!s) throw new Error("useSettings must be used inside <SiteProvider>");
  return s;
}

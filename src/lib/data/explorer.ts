import "server-only";
import { STATES } from "../states";
import { toSummary } from "./queries";
import type { Car, SiteData } from "./types";
import type { ShowroomOption } from "@/components/cars/StockExplorer";

/** Props for <StockExplorer> built from a set of cars. */
export function explorerProps(data: SiteData, cars: Car[]) {
  const stateSlugs = new Set(cars.map((c) => c.stateSlug));
  return {
    cars: cars.map((c) => toSummary(c, data.settings)),
    showrooms: data.showrooms.map<ShowroomOption>((s) => ({ id: s.showroom_id, name: s.name, stateSlug: s.stateSlug })),
    states: STATES.filter((s) => stateSlugs.has(s.slug)).map((s) => ({ slug: s.slug, name: s.name })),
  };
}

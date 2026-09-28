import type { AgentRow, ShowroomRow, StockRow } from "./schema";
import type { LoanSettings } from "../loan";

export type Car = StockRow & {
  slug: string;
  title: string; // "Toyota Alphard 2.5 SC"
  makeSlug: string;
  modelSlug: string;
  stateSlug: string;
  stateName: string;
};

export type Showroom = ShowroomRow & { stateSlug: string; stateName: string };

export type Agent = AgentRow & { stateSlug: string | "hq" };

export type Settings = LoanSettings & { hqWhatsapp: string; ownerWhatsapp: string };

export type SiteData = {
  stock: Car[]; // every valid row including Sold/Hidden; use queries.ts to filter
  showrooms: Showroom[];
  agents: Agent[]; // active and inactive
  settings: Settings;
  warnings: string[];
  loadedAt: string;
  source: "sheets" | "sample";
};

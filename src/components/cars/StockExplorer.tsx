"use client";

import Fuse from "fuse.js";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import type { CarSummary } from "@/lib/data/queries";
import { BODY_TYPES } from "@/lib/data/schema";
import { applyFilters, countActive, EMPTY_FILTERS, filtersToQuery, parseFilters, sortCars, SORTS, type Filters, type SortKey } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Modal } from "@/components/ui/Modal";
import { FilterIcon, SearchIcon } from "@/components/ui/Icons";
import { CarGrid } from "./CarCard";

export type ShowroomOption = { id: string; name: string; stateSlug: string };

const PAGE = 24;
const PRICE_STEPS = [50, 80, 100, 120, 150, 180, 200, 250, 300, 400, 500, 700, 1000].map((k) => k * 1000);
const MONTHLY_STEPS = [1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000];
const KM_STEPS = [10000, 20000, 30000, 50000, 80000, 120000];
const GRADES = [3.5, 4, 4.5, 5];

function searchText(c: CarSummary) {
  const compact = `${c.model}${c.variant}`.replace(/[\s.-]/g, "");
  return `${c.code} ${c.make} ${c.model} ${c.variant} ${c.year} ${c.body} ${c.colour} ${c.state} ${c.fuel} ${c.transmission} ${compact}`.toLowerCase();
}

/** Fuse extended search: tokens are ANDed, numbers must appear exactly ("2021"), words are fuzzy ("alfard"). */
function toFuseQuery(q: string) {
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => (/^\d+$/.test(t) ? `'${t}` : t.replace(/[|!^$=']/g, "")))
    .join(" ");
}

export function StockExplorer({
  cars,
  locked = {},
  showrooms,
  states,
}: {
  cars: CarSummary[];
  locked?: Partial<Filters>;
  showrooms: ShowroomOption[];
  states: { slug: string; name: string }[];
}) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => ({ ...parseFilters(Object.fromEntries(searchParams)), ...locked }));
  const [limit, setLimit] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);
  const q = useDeferredValue(filters.q);

  const fuse = useMemo(
    () =>
      new Fuse(
        cars.map((c) => ({ c, text: searchText(c) })),
        { keys: ["text"], threshold: 0.3, ignoreLocation: true, useExtendedSearch: true },
      ),
    [cars],
  );

  const results = useMemo(() => {
    const matched = q.trim() ? fuse.search(toFuseQuery(q)).map((r) => r.item.c) : cars;
    const filtered = applyFilters(matched, filters);
    // Keyword search keeps relevance order unless the buyer picked a sort.
    return q.trim() && filters.sort === "newest" ? filtered : sortCars(filtered, filters.sort);
  }, [q, fuse, cars, filters]);

  // URL sync (shareable searches) + analytics, debounced.
  const firstRun = useRef(true);
  useEffect(() => {
    const qs = filtersToQuery(filters, locked);
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const t = setTimeout(() => {
      if (filters.q.trim()) track("search", { search_term: filters.q.trim(), results: results.length });
      else track("filter_apply", { filters: qs, results: results.length });
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- results.length is read at fire time only
  }, [filters, locked]);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => {
    setLimit(PAGE);
    setFilters((f) => ({ ...f, [k]: v, ...(k === "make" ? { model: "" } : {}) }));
  };
  const clear = () => {
    setLimit(PAGE);
    setFilters({ ...EMPTY_FILTERS, ...locked });
  };

  const makes = useMemo(() => {
    const m = new Map<string, { name: string; models: Map<string, string> }>();
    for (const c of cars) {
      if (!m.has(c.makeSlug)) m.set(c.makeSlug, { name: c.make, models: new Map() });
      m.get(c.makeSlug)!.models.set(c.modelSlug, c.model);
    }
    return [...m.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [cars]);
  const years = useMemo(() => [...new Set(cars.map((c) => c.year))].sort((a, b) => b - a), [cars]);
  const active = countActive(filters, locked);

  const numSelect = (k: "ymin" | "ymax" | "pmin" | "pmax" | "mmin" | "mmax" | "km" | "grade", label: string, steps: number[], fmt: (n: number) => string) => (
    <div>
      <label className="label" htmlFor={`f-${k}`}>
        {label}
      </label>
      <select id={`f-${k}`} className="field" value={filters[k] ?? ""} onChange={(e) => set(k, e.target.value === "" ? undefined : Number(e.target.value))}>
        <option value="">Any</option>
        {steps.map((s) => (
          <option key={s} value={s}>
            {fmt(s)}
          </option>
        ))}
      </select>
    </div>
  );

  const filterFields = (
    <div className="space-y-4">
      {!locked.make && (
        <div>
          <label className="label" htmlFor="f-make">
            Make
          </label>
          <select id="f-make" className="field" value={filters.make} onChange={(e) => set("make", e.target.value)}>
            <option value="">All makes</option>
            {makes.map(([slug, m]) => (
              <option key={slug} value={slug}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {!locked.model && filters.make && (
        <div>
          <label className="label" htmlFor="f-model">
            Model
          </label>
          <select id="f-model" className="field" value={filters.model} onChange={(e) => set("model", e.target.value)}>
            <option value="">All models</option>
            {[...(makes.find(([s]) => s === filters.make)?.[1].models ?? [])].map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
      {!locked.body && (
        <fieldset>
          <legend className="label">Body type</legend>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map((b) => {
              const on = filters.body.toLowerCase() === b.toLowerCase();
              return (
                <button
                  key={b}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set("body", on ? "" : b.toLowerCase())}
                  className={`chip ${on ? "border-ink bg-ink text-paper hover:border-ink" : ""}`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="grid grid-cols-2 gap-3">
        {numSelect("pmin", "Min price", PRICE_STEPS, (n) => `RM ${n / 1000}k`)}
        {numSelect("pmax", "Max price", PRICE_STEPS, (n) => `RM ${n / 1000}k`)}
        {numSelect("mmin", "Min monthly", MONTHLY_STEPS, (n) => `RM ${formatNumber(n)}`)}
        {numSelect("mmax", "Max monthly", MONTHLY_STEPS, (n) => `RM ${formatNumber(n)}`)}
        {numSelect("ymin", "Year from", years, String)}
        {numSelect("ymax", "Year to", years, String)}
        {numSelect("km", "Max mileage", KM_STEPS, (n) => `${formatNumber(n)} km`)}
        {numSelect("grade", "Min grade", GRADES, (n) => `${n}+`)}
      </div>
      {!locked.state && (
        <div>
          <label className="label" htmlFor="f-state">
            State
          </label>
          <select id="f-state" className="field" value={filters.state} onChange={(e) => set("state", e.target.value)}>
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="f-showroom">
          Showroom
        </label>
        <select id="f-showroom" className="field" value={filters.showroom} onChange={(e) => set("showroom", e.target.value)}>
          <option value="">All showrooms</option>
          {showrooms
            .filter((s) => !filters.state || s.stateSlug === filters.state)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="f-trans">
          Transmission
        </label>
        <select id="f-trans" className="field" value={filters.trans} onChange={(e) => set("trans", e.target.value)}>
          <option value="">Any</option>
          <option value="auto">Automatic</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      {active > 0 && (
        <button type="button" onClick={clear} className="btn btn-outline w-full">
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-xl border border-line bg-card p-4">{filterFields}</div>
      </aside>

      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search cars</span>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              className="field pl-10"
              placeholder="Search Alphard, Harrier, BMW…"
              value={filters.q}
              onChange={(e) => set("q", e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline flex-1 lg:hidden" onClick={() => setDrawer(true)}>
              <FilterIcon /> Filters{active ? ` (${active})` : ""}
            </button>
            <label className="flex-1 sm:w-52 sm:flex-none">
              <span className="sr-only">Sort by</span>
              <select className="field" value={filters.sort} onChange={(e) => set("sort", e.target.value as SortKey)}>
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="mb-3 text-sm text-muted" aria-live="polite">
          {results.length} {results.length === 1 ? "car" : "cars"} found
        </p>

        {results.length ? (
          <>
            <CarGrid cars={results.slice(0, limit)} priorityFirst={2} />
            {results.length > limit && (
              <div className="mt-6 text-center">
                <button type="button" className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE)}>
                  Show more ({results.length - limit} left)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center">
            <p className="font-serif text-2xl">No exact match in stock today.</p>
            <p className="mt-2 text-ink-2">Stock changes daily and we source from many APs. Tell us what you want and we will find it.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link href="/find-me-a-car" className="btn btn-primary">
                Find me a car
              </Link>
              <button type="button" onClick={clear} className="btn btn-outline">
                Clear search
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filters">
        {filterFields}
        <button type="button" className="btn btn-primary sticky bottom-0 mt-4 w-full" onClick={() => setDrawer(false)}>
          Show {results.length} cars
        </button>
      </Modal>
    </div>
  );
}

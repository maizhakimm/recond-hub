import { Suspense } from "react";
import type { CarSummary } from "@/lib/data/queries";
import type { Filters } from "@/lib/filters";
import { CarGrid } from "./CarCard";
import { StockExplorer, type ShowroomOption } from "./StockExplorer";

/**
 * Pages stay static (ISR); filters are read from the URL in the browser.
 * The server-rendered fallback is the unfiltered grid, so crawlers and slow phones still see cars.
 */
export function Explorer(props: { cars: CarSummary[]; locked?: Partial<Filters>; showrooms: ShowroomOption[]; states: { slug: string; name: string }[] }) {
  return (
    <Suspense
      fallback={
        <div>
          <p className="mb-3 text-sm text-muted">{props.cars.length} cars found</p>
          <h2 className="sr-only">Search results</h2>
          <CarGrid cars={props.cars.slice(0, 24)} priorityFirst={2} narrow />
        </div>
      }
    >
      <StockExplorer {...props} />
    </Suspense>
  );
}

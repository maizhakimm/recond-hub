/** Shown while a page streams in. Mirrors the card grid so the layout doesn't jump. */
export default function Loading() {
  return (
    <div className="container-page py-8" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-2/3 max-w-md animate-pulse rounded-md bg-paper-2" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded-md bg-paper-2" />
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="overflow-hidden rounded-md border border-line">
            <div className="aspect-[16/10] animate-pulse bg-paper-2" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-paper-2" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-paper-2" />
              <div className="h-6 w-1/2 animate-pulse rounded bg-paper-2" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

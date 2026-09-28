import Link from "next/link";
import type { CarSummary } from "@/lib/data/queries";
import { carAlt, formatKm, formatRM } from "@/lib/format";
import { CarImage } from "./CarImage";
import { GradeBadge, StatusBadge, TrustRow } from "./Badges";
import { WhatsAppButton } from "./WhatsAppButton";
import { PinIcon } from "@/components/ui/Icons";

export function CarCard({ car, priority = false }: { car: CarSummary; priority?: boolean }) {
  const href = `/cars/${car.slug}`;
  const name = `${car.year} ${car.make} ${car.model}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-sm transition hover:shadow-md">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-paper-2" aria-label={`${name} ${car.variant}`}>
        <CarImage
          src={car.cover}
          alt={carAlt(car)}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-300 group-hover:scale-[1.02] ${car.status === "Sold" ? "grayscale" : ""}`}
          priority={priority}
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <StatusBadge status={car.status} />
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-1.5 py-0.5 text-[11px] font-medium text-paper tnum">#{car.code}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-sans text-base font-semibold leading-snug tracking-normal">
            <Link href={href} className="hover:underline">
              {car.make} {car.model}
            </Link>
            <span className="block text-sm font-normal text-muted">
              {car.variant ? `${car.variant} · ` : ""}
              {car.year}
            </span>
          </h3>
          <GradeBadge grade={car.grade} />
        </div>
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-ink-2 tnum">
          <span>{formatKm(car.mileage)}</span>
          <span className="inline-flex items-center gap-1">
            <PinIcon className="h-3.5 w-3.5" />
            {car.state}
          </span>
        </p>
        <TrustRow compact />
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="whitespace-nowrap text-xl font-bold tnum">{car.status === "Sold" ? "Sold" : formatRM(car.price)}</p>
            {car.status !== "Sold" && <p className="whitespace-nowrap text-xs text-muted tnum">from {formatRM(car.monthly)}/month</p>}
          </div>
          {car.status !== "Sold" && (
            <WhatsAppButton
              className="btn btn-wa px-3"
              label="Ask"
              ariaLabel={`WhatsApp about ${name} #${car.code}`}
              carCode={car.code}
              state={car.stateSlug}
              message={`Hi, I'm interested in ${name} ${car.variant} · #${car.code}`}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function CarGrid({ cars, priorityFirst = 0, narrow = false }: { cars: CarSummary[]; priorityFirst?: number; narrow?: boolean }) {
  return (
    <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${narrow ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
      {cars.map((c, i) => (
        <li key={c.code}>
          <CarCard car={c} priority={i < priorityFirst} />
        </li>
      ))}
    </ul>
  );
}

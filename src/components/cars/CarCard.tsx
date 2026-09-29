import Link from "next/link";
import type { CarSummary } from "@/lib/data/queries";
import { carAlt, formatKm, formatRM } from "@/lib/format";
import { CarImage } from "./CarImage";
import { StatusBadge } from "./Badges";
import { WhatsAppButton } from "./WhatsAppButton";
import { PinIcon, ShieldIcon } from "@/components/ui/Icons";

export function CarCard({ car, priority = false }: { car: CarSummary; priority?: boolean }) {
  const href = `/cars/${car.slug}`;
  const name = `${car.year} ${car.make} ${car.model}`;
  const sold = car.status === "Sold";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-line bg-card transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(14,17,22,0.25)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-2 sm:aspect-[16/11]">
        <CarImage
          src={car.cover}
          alt={carAlt(car)}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition duration-500 group-hover:scale-[1.03] ${sold ? "grayscale" : ""}`}
          priority={priority}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {!sold && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-trust shadow-sm">
              <ShieldIcon className="h-3.5 w-3.5" /> Auction sheet verified
            </span>
          )}
          <StatusBadge status={car.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-0 p-4 pb-4">
        <h3 className="text-base font-bold leading-snug tracking-tight">
          {/* Whole card is clickable; the WhatsApp button sits above the link layer */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {name}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-sm text-muted">{car.variant || car.body}</p>

        <ul className="mb-4 mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-2 tnum">
          <li>{formatKm(car.mileage)}</li>
          {car.grade && <li>Grade {car.grade}</li>}
          <li className="inline-flex items-center gap-1">
            <PinIcon className="h-3.5 w-3.5 text-muted" />
            {car.state}
          </li>
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="whitespace-nowrap text-xl font-extrabold tracking-tight tnum">{sold ? "Sold" : formatRM(car.price)}</p>
            {!sold && <p className="whitespace-nowrap text-xs font-medium text-muted tnum">from {formatRM(car.monthly)}/mo</p>}
          </div>
          {!sold && (
            <WhatsAppButton
              className="btn btn-wa relative z-10 hidden h-11 w-11 rounded-full p-0 sm:inline-flex [&>span]:sr-only"
              label={`WhatsApp about ${name} #${car.code}`}
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
    <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 ${narrow ? "xl:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"}`}>
      {cars.map((c, i) => (
        <li key={c.code}>
          <CarCard car={c} priority={i < priorityFirst} />
        </li>
      ))}
    </ul>
  );
}

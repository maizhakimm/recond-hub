import type { CarSummary } from "@/lib/data/queries";
import { ShieldIcon } from "@/components/ui/Icons";

export function StatusBadge({ status }: { status: CarSummary["status"] }) {
  if (status === "Reserved") return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-sm">Reserved</span>;
  if (status === "Sold") return <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">Sold</span>;
  return null;
}

export function GradeBadge({ grade, large = false }: { grade: string; large?: boolean }) {
  if (!grade) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-line bg-paper-2 font-semibold text-ink tnum ${large ? "px-3 py-1.5 text-base" : "px-2 py-0.5 text-xs"}`}
      title="Japanese auction grade"
    >
      Grade {grade}
    </span>
  );
}

export function TrustRow({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-2 font-medium text-trust ${compact ? "text-xs" : "text-sm"}`}>
      <li className="inline-flex items-center gap-1 rounded-full bg-trust-bg px-2.5 py-1">
        <ShieldIcon className="h-3.5 w-3.5" /> Auction sheet verified
      </li>
      <li className="inline-flex items-center gap-1 rounded-full bg-trust-bg px-2.5 py-1">
        <ShieldIcon className="h-3.5 w-3.5" /> Warranty included
      </li>
    </ul>
  );
}

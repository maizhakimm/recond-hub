import Link from "next/link";
import { BRAND } from "@/lib/config";
import { MenuIcon, SearchIcon } from "@/components/ui/Icons";

const NAV = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/showrooms", label: "Showrooms" },
  { href: "/guide", label: "Recond Guide" },
  { href: "/loan-calculator", label: "Loan calculator" },
  { href: "/find-me-a-car", label: "Find me a car" },
  { href: "/why-us", label: "Why us" },
];

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2" aria-label={`${BRAND} home`}>
      <span className={`grid h-8 w-8 place-items-center rounded-md font-serif text-lg font-bold ${dark ? "bg-champagne text-night" : "bg-ink text-champagne"}`}>R</span>
      <span className={`font-serif text-2xl font-semibold tracking-tight ${dark ? "text-[#f1ead9]" : "text-ink"}`}>{BRAND}</span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="rounded-md px-3 py-2 hover:bg-paper-2">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/private" className="ml-2 rounded-md bg-night px-3 py-2 text-champagne hover:bg-night-3">
                Private Sourcing
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-1 lg:hidden">
          <Link href="/cars" className="grid h-11 w-11 place-items-center rounded-md hover:bg-paper-2" aria-label="Search cars">
            <SearchIcon />
          </Link>
          <details className="group relative">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-md hover:bg-paper-2 [&::-webkit-details-marker]:hidden" aria-label="Menu">
              <MenuIcon />
            </summary>
            <nav aria-label="Mobile" className="absolute right-0 top-12 w-64 rounded-xl border border-line bg-card p-2 shadow-lg">
              <ul>
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="flex min-h-11 items-center rounded-md px-3 hover:bg-paper-2">
                      {n.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/private" className="mt-1 flex min-h-11 items-center rounded-md bg-night px-3 text-champagne">
                    Private Sourcing
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

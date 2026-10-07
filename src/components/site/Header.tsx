import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/config";
import { SearchIcon } from "@/components/ui/Icons";
import { MobileMenu } from "./MobileMenu";

const NAV = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/showrooms", label: "Coverage" },
  { href: "/guide", label: "Recond Guide" },
  { href: "/loan-calculator", label: "Loan calculator" },
  { href: "/find-me-a-car", label: "Find me a car" },
  { href: "/why-us", label: "Why us" },
];

const LOGO_SRC = "/photos/file_00000000a3fc81fa8d64bb1608950c3a.png";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 items-center" aria-label={`${BRAND} home`}>
      <Image src={LOGO_SRC} alt={`${BRAND} — Quality Used Car, Trusted Deals`} width={420} height={120} priority className={`h-11 w-auto object-contain ${dark ? "brightness-0 invert" : ""}`} />
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">Skip to content</a>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm font-medium">
            {NAV.map((n) => <li key={n.href}><Link href={n.href} className="rounded-lg px-3 py-2 text-ink-2 hover:bg-paper-2 hover:text-ink">{n.label}</Link></li>)}
            <li><Link href="/private" className="ml-2 rounded-lg bg-ink px-4 py-2 text-champagne hover:bg-night-3">Private Sourcing</Link></li>
          </ul>
        </nav>
        <div className="flex items-center gap-0.5 lg:hidden">
          <Link href="/cars" className="grid h-11 w-11 place-items-center rounded-md hover:bg-paper-2" aria-label="Search cars"><SearchIcon /></Link>
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}

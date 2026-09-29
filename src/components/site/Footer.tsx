import Link from "next/link";
import { BRAND, BRAND_TAGLINE, LEGAL_NAME, SOCIAL } from "@/lib/config";
import { STATES } from "@/lib/states";
import { Logo } from "./Header";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-paper-2 pb-24 lg:pb-0">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-ink-2">
            {BRAND}, known on TikTok as &ldquo;{BRAND_TAGLINE}&rdquo;. Auction-sheet verified recond cars, 10+ showrooms and agents across Malaysia.
          </p>
          <p className="text-sm">
            <a href={SOCIAL.tiktok} className="font-medium text-gold-text underline" rel="noopener" target="_blank">
              Follow us on TikTok
            </a>
          </p>
        </div>
        <nav aria-label="Cars" className="text-sm">
          <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider">Cars</h2>
          <ul className="space-y-1">
            {[
              ["/cars", "All recond cars"],
              ["/cars/toyota/alphard", "Toyota Alphard recond"],
              ["/cars/toyota/vellfire", "Toyota Vellfire recond"],
              ["/cars/toyota/harrier", "Toyota Harrier recond"],
              ["/cars/body/mpv", "Recond MPV"],
              ["/cars/body/suv", "Recond SUV"],
              ["/cars/under-200k", "Recond cars under RM200k"],
              ["/find-me-a-car", "Find me a car"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-8 items-center hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company" className="text-sm">
          <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider">{BRAND}</h2>
          <ul className="space-y-1">
            {[
              ["/why-us", "Why buy with us"],
              ["/showrooms", "Showrooms"],
              ["/guide", "Recond Guide"],
              ["/loan-calculator", "Loan calculator"],
              ["/private", "Private Sourcing"],
              ["/become-an-agent", "Become an agent"],
              ["/about", "About"],
              ["/contact", "Contact"],
              ["/privacy", "Privacy policy (PDPA)"],
              ["/terms", "Terms"],
              ["/credits", "Photo credits"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-8 items-center hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="States" className="text-sm">
          <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider">Kereta recond by state</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
            {STATES.map((s) => (
              <li key={s.slug}>
                <Link href={`/${s.slug}`} className="inline-flex min-h-8 items-center hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-4 text-xs text-muted">
          © {new Date().getFullYear()} {LEGAL_NAME}. Prices and monthly instalments are estimates and subject to bank approval.
        </p>
      </div>
    </footer>
  );
}

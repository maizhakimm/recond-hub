import Link from "next/link";
import { Logo } from "@/components/site/Header";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-private min-h-dvh bg-night text-[#f1ead9]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo dark />
          <Link href="/" className="inline-flex min-h-11 items-center text-sm text-[#b9ae98] hover:text-champagne">
            Recond stock →
          </Link>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="border-t border-[#2a261f] py-8 text-center text-xs text-[#8c826f]">
        Private Sourcing is handled personally and in confidence. ·{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}

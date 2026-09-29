"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";

export type NavItem = { href: string; label: string };

/**
 * Phone menu: slides down under the header with a dimmed backdrop.
 * Closes on backdrop tap, Esc, link tap and route change; locks page scroll while open.
 */
export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const button = useRef<HTMLButtonElement>(null);

  // Close whenever the route changes (e.g. browser back).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="grid h-11 w-11 place-items-center rounded-md hover:bg-paper-2"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Portal: the header's backdrop-filter would otherwise trap these fixed layers inside the header box. */}
      {open &&
        createPortal(
        <>
          <button type="button" aria-label="Close menu" tabIndex={-1} className="fixed inset-0 top-16 z-40 bg-ink/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <nav id="mobile-menu" aria-label="Mobile" className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-white px-4 pb-6 pt-2 shadow-xl">
            <ul className="divide-y divide-line">
              {items.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === n.href ? "page" : undefined}
                    className="flex min-h-13 items-center justify-between text-base font-semibold aria-[current=page]:text-gold-text"
                  >
                    {n.label}
                    <span aria-hidden className="text-muted">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2">
              <Link href="/private" onClick={() => setOpen(false)} className="btn w-full bg-ink text-champagne">
                Private Sourcing
              </Link>
              <WhatsAppButton className="btn btn-wa w-full" label="WhatsApp us" message="Hi, I'm looking for a recond car." />
            </div>
          </nav>
        </>,
          document.body,
        )}
    </>
  );
}


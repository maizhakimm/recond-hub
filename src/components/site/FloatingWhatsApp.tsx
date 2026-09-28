"use client";

import { usePathname } from "next/navigation";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";

/** One-thumb WhatsApp on every page. Car pages have their own sticky CTA bar instead. */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (/^\/cars\/[a-z]{1,5}\d+-/.test(pathname)) return null;
  return (
    <div className="fixed bottom-4 right-4 z-30">
      <WhatsAppButton
        className="btn btn-wa h-14 w-14 rounded-full p-0 shadow-lg sm:w-auto sm:px-5 [&>span]:sr-only sm:[&>span]:not-sr-only"
        label="WhatsApp us"
        message="Hi, I'm looking for a recond car."
      />
    </div>
  );
}

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
        className="btn btn-wa h-14 rounded-full px-5 shadow-lg"
        label="WhatsApp us"
        message="Hi, I'm looking for a recond car."
      />
    </div>
  );
}

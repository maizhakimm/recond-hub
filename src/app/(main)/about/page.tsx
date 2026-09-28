import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/site/Prose";
import { BRAND, BRAND_TAGLINE } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us",
  description: `${BRAND}, known on TikTok as ${BRAND_TAGLINE}: recond cars from Japan and the UK, sold across Malaysia.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ProsePage title={`About ${BRAND}`} path="/about" intro={`You may know us from TikTok as "${BRAND_TAGLINE}".`}>
      <p>
        {BRAND} sells reconditioned cars imported from Japan and the United Kingdom. Our stock comes from our own imports and from a network of approved permit
        (AP) holders across Malaysia, so the range changes every day.
      </p>
      <p>
        We run 10+ showrooms and are building a team with an agent in every Malaysian state, backed by sales advisors at HQ. Whether you are in Johor Bahru or
        Kota Kinabalu, you can see a car, get a loan estimate and book a viewing from your phone.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li>Show the auction sheet. Every car, every time.</li>
        <li>Show the real price and a realistic monthly instalment.</li>
        <li>Answer on WhatsApp, fast.</li>
      </ul>
      <p>
        <Link href="/cars">Browse our stock</Link>, read the <Link href="/guide">Recond Guide</Link>, or <Link href="/showrooms">find a showroom</Link>.
      </p>
    </ProsePage>
  );
}

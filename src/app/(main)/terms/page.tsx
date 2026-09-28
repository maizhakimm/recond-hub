import type { Metadata } from "next";
import { ProsePage } from "@/components/site/Prose";
import { BRAND, LEGAL_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using the ${BRAND} website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ProsePage title="Terms of use" path="/terms" intro="Last updated 28 September 2026.">
      <h2>Listings and prices</h2>
      <p>
        Stock, prices and specifications are updated daily but may change without notice. A listing is an invitation to enquire, not an offer. A car is only
        reserved once you have paid a booking fee and received written confirmation from {BRAND}.
      </p>
      <h2>Estimates</h2>
      <p>
        Monthly instalments, loan calculations, eligibility (DSR) results and trade-in values on this website are estimates for guidance only. Final figures
        depend on the bank, your credit profile and a physical inspection.
      </p>
      <h2>Auction sheets and grades</h2>
      <p>Auction sheets are issued by third-party auction houses. We verify them before purchase but cannot guarantee their accuracy.</p>
      <h2>Warranty</h2>
      <p>Warranty terms, coverage and duration are set out in the warranty document provided on purchase and prevail over any description on this website.</p>
      <h2>Private Sourcing</h2>
      <p>Private Sourcing requests are not binding on either party until a written purchase agreement and deposit are in place.</p>
      <h2>Liability</h2>
      <p>
        To the extent permitted by law, {LEGAL_NAME} is not liable for any loss arising from reliance on information on this website. These terms are governed by
        the laws of Malaysia.
      </p>
    </ProsePage>
  );
}

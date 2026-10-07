import type { Metadata } from "next";
import { ProsePage } from "@/components/site/Prose";
import { BRAND, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using the ${BRAND} website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ProsePage title="Terms of use" path="/terms" intro="Last updated 7 October 2026.">
      <h2>About RecondHub</h2>
      <p>
        {BRAND} is a brand and online automotive platform focused on the marketing of reconditioned vehicles and the facilitation of vehicle enquiries in Malaysia. References to &ldquo;{BRAND}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; refer to the operator of the {BRAND} platform. {BRAND} does not represent itself as an incorporated company unless expressly stated otherwise.
      </p>
      <h2>Listings and availability</h2>
      <p>
        Vehicle listings, availability, prices, specifications, mileage, grades, features and other information may change without notice. We aim to keep listing information current, but users should confirm important details before making a purchase decision. A website listing or enquiry is not by itself a binding offer or reservation.
      </p>
      <h2>Vehicle enquiries and transactions</h2>
      <p>
        {BRAND} facilitates enquiries and may connect users with relevant sales contacts, vehicle dealers, showrooms, agents or other parties involved in a vehicle transaction. The identity of the actual seller and the applicable transaction documents should be confirmed before any booking fee, deposit or purchase payment is made.
      </p>
      <h2>Estimates</h2>
      <p>
        Any monthly instalment, financing, eligibility, trade-in or other calculated figure displayed on the website is an estimate for general guidance only. Final financing approval, rates and figures are determined by the relevant financial institution or service provider.
      </p>
      <h2>Auction sheets and vehicle information</h2>
      <p>
        Auction sheets, grades and other third-party vehicle records may originate from auction houses, suppliers or other third parties. They are provided for reference and should be independently verified where appropriate before purchase.
      </p>
      <h2>Warranty</h2>
      <p>
        Where a vehicle is offered with a warranty, the actual warranty provider, coverage, exclusions and duration are governed by the warranty documentation supplied for that vehicle or transaction. Information on this website does not replace those documents.
      </p>
      <h2>Private sourcing</h2>
      <p>
        A private sourcing request or other enquiry submitted through the website is not binding on either party unless and until the relevant parties enter into written transaction terms and any required payment is accepted.
      </p>
      <h2>Third-party links and services</h2>
      <p>
        The website may link to or interact with third-party services such as WhatsApp, financing providers, dealers, showrooms or other external services. {BRAND} is not responsible for the availability, content or independent practices of third-party services.
      </p>
      <h2>Limitation and use of information</h2>
      <p>
        Information on this website is provided for general informational and marketing purposes. To the extent permitted by applicable law, the platform operator is not responsible for losses arising solely from reliance on website information that has not been independently confirmed before a transaction.
      </p>
      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of Malaysia.</p>
      <h2>Contact</h2>
      <p>
        Questions regarding these Terms may be sent to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ProsePage>
  );
}

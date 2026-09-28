import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadForm, type Field } from "@/components/forms/LeadForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CheckIcon } from "@/components/ui/Icons";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  title: "Become a Recond Car Agent · Join Us in Your State",
  description: `Join ${BRAND} as a recond car agent in your state. Sell from nationwide stock with leads, training and commission. Apply on WhatsApp.`,
  alternates: { canonical: "/become-an-agent" },
};

const FIELDS: Field[] = [
  { name: "name", label: "Full name", required: true, autoComplete: "name", half: true },
  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel", placeholder: "012-345 6789", half: true },
  { name: "state", label: "State you'll cover", type: "select", options: "states", required: true, half: true },
  { name: "experience", label: "Car sales experience", type: "select", options: ["None yet", "Under 1 year", "1 – 3 years", "3 – 5 years", "5+ years"], required: true, half: true },
  { name: "about", label: "Tell us about yourself", type: "textarea", placeholder: "Current job, social media following, network…" },
];

export default function BecomeAgentPage() {
  return (
    <div className="container-page max-w-3xl py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Become an agent", href: "/become-an-agent" },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">Become our agent</h1>
      <p className="mt-2 text-ink-2">We&rsquo;re building a {BRAND} agent in every Malaysian state. You bring the local network; we bring the stock and support.</p>
      <ul className="my-6 grid gap-2 sm:grid-cols-2">
        {[
          "Sell from our nationwide stock and partner APs",
          "Leads from your state routed to you",
          "Your own referral link, tracked for 30 days",
          "Training on auction sheets, loans and paperwork",
        ].map((t) => (
          <li key={t} className="flex gap-2">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {t}
          </li>
        ))}
      </ul>
      <Suspense>
        <LeadForm kind="agent_application" fields={FIELDS} />
      </Suspense>
    </div>
  );
}

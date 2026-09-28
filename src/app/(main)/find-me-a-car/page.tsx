import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadForm, type Field } from "@/components/forms/LeadForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = {
  title: "Find Me a Car · Recond Car Sourcing Malaysia",
  description: `Can't find the recond car you want? Tell ${BRAND} the make, model, budget and year. We source from Japan, the UK and our AP network.`,
  alternates: { canonical: "/find-me-a-car" },
};

const FIELDS: Field[] = [
  { name: "make", label: "Make", required: true, placeholder: "Toyota", half: true },
  { name: "model", label: "Model", required: true, placeholder: "Alphard", half: true },
  { name: "budget", label: "Budget", type: "select", options: ["Under RM100k", "RM100k – 150k", "RM150k – 200k", "RM200k – 300k", "RM300k – 500k", "RM500k+"], required: true, half: true },
  { name: "timeline", label: "When do you need it?", type: "select", options: ["Within 2 weeks", "Within 1 month", "1 – 3 months", "Just browsing"], half: true },
  { name: "year_from", label: "Year from", type: "year", placeholder: "2020", half: true },
  { name: "year_to", label: "Year to", type: "year", placeholder: "2023", half: true },
  { name: "notes", label: "Variant, colour or must-haves", type: "textarea", placeholder: "SC package, pilot seats, white or black" },
  { name: "name", label: "Name", required: true, autoComplete: "name", half: true },
  { name: "phone", label: "Phone", type: "tel", required: true, autoComplete: "tel", placeholder: "012-345 6789", half: true },
  { name: "state", label: "Your state", type: "select", options: "states", half: true },
];

export default function FindMeACarPage() {
  return (
    <div className="container-page max-w-3xl py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Find me a car", href: "/find-me-a-car" },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">Find me a car</h1>
      <p className="mb-6 mt-2 text-ink-2">
        Not in stock today? We buy from many APs every week and import directly from Japanese and UK auctions. Tell us what you want and we&rsquo;ll come back with
        options, usually within 48 hours.
      </p>
      <Suspense>
        <LeadForm kind="find_me_a_car" fields={FIELDS} />
      </Suspense>
    </div>
  );
}

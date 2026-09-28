import type { Metadata } from "next";
import Link from "next/link";
import { LoanCalculator } from "@/components/cars/LoanCalculator";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Car Loan Calculator Malaysia · Kira Ansuran Kereta Recond",
  description:
    "Calculate your monthly car instalment with the Malaysian flat-rate hire purchase formula, then check your DSR to see if the bank is likely to approve.",
  alternates: { canonical: "/loan-calculator" },
};

const FAQ = [
  {
    q: "How is a car loan calculated in Malaysia?",
    a: "Hire purchase uses a flat rate: total interest = loan amount × rate × years. Add it to the loan and divide by the number of months to get the instalment.",
  },
  {
    q: "What is DSR?",
    a: "Debt service ratio: all your monthly commitments, including the new car, divided by your income. Many banks are comfortable below 60%.",
  },
  { q: "What is the maximum tenure for a recond car?", a: "Up to 9 years, depending on the bank and the age of the car." },
];

export default function LoanCalculatorPage() {
  return (
    <div className="container-page max-w-5xl py-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Loan calculator", href: "/loan-calculator" },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">Car loan calculator</h1>
      <p className="mb-6 mt-2 max-w-2xl text-ink-2">
        Kira ansuran bulanan for any recond car, then check whether your salary is likely to qualify. Want the numbers explained? Read{" "}
        <Link href="/guide/salary-needed-for-rm200k-car-loan" className="font-medium text-gold-text underline">
          how much salary you need for a RM200k car loan
        </Link>
        .
      </p>
      <LoanCalculator />
      <section className="mt-12 max-w-3xl">
        <h2 className="mb-4 text-3xl">Common questions</h2>
        <dl className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-ink-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

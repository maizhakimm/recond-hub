import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/cars/WhatsAppButton";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ShowroomCard } from "@/components/site/ContactCards";
import { BRAND, CONTACT_EMAIL } from "@/lib/config";
import { getSiteData } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us",
  description: `WhatsApp ${BRAND}, find a showroom, or email us. We reply fast.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const data = await getSiteData();
  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
      <h1 className="text-4xl sm:text-5xl">Contact us</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-line bg-card p-5">
          <h2 className="text-2xl">WhatsApp</h2>
          <p className="mt-1 text-ink-2">Fastest way to reach us. We&rsquo;ll connect you with the agent for your state.</p>
          <WhatsAppButton className="btn btn-wa mt-4 w-full" label="Chat on WhatsApp" message={`Hi ${BRAND}, I have a question.`} />
        </div>
        <div className="rounded-md border border-line bg-card p-5">
          <h2 className="text-2xl">Email</h2>
          <p className="mt-1 text-ink-2">For partnerships, AP stock offers and media.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-outline mt-4 w-full">
            {CONTACT_EMAIL}
          </a>
        </div>
        <div className="rounded-md border border-line bg-card p-5">
          <h2 className="text-2xl">Visit</h2>
          <p className="mt-1 text-ink-2">{data.showrooms.length} showrooms across Malaysia.</p>
          <Link href="/showrooms" className="btn btn-outline mt-4 w-full">
            Find a showroom
          </Link>
        </div>
      </div>
      <h2 className="mb-4 mt-12 text-3xl">Showrooms</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.showrooms.map((s) => (
          <ShowroomCard key={s.showroom_id} s={s} />
        ))}
      </div>
    </div>
  );
}

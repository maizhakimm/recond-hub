import type { Metadata } from "next";
import { ProsePage } from "@/components/site/Prose";
import { BRAND, CONTACT_EMAIL, LEGAL_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy (PDPA)",
  description: `How ${BRAND} collects and uses your personal data under Malaysia's Personal Data Protection Act 2010.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" path="/privacy" intro="Notice under the Personal Data Protection Act 2010 (PDPA). Last updated 28 September 2026.">
      <h2>Who we are</h2>
      <p>
        This website is operated by {LEGAL_NAME} (&ldquo;{BRAND}&rdquo;, &ldquo;we&rdquo;). We are the data user for personal data collected through this website.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Details you give us in forms or WhatsApp: name, phone number, state, preferred viewing date and time, the car you are interested in, trade-in details, and income figures you enter in the loan eligibility check.</li>
        <li>The page you came from, campaign tags (UTM parameters) and, if you arrived through an agent&rsquo;s link, that agent&rsquo;s ID (kept in a cookie for 30 days).</li>
        <li>Analytics data through Google Analytics, Meta Pixel and TikTok Pixel, which use cookies to measure visits and advertising.</li>
      </ul>
      <h2>Why we use it</h2>
      <ul>
        <li>To reply to your enquiry, arrange viewings, prepare loan applications and trade-in valuations.</li>
        <li>To assign your enquiry to the right showroom, agent or sales advisor.</li>
        <li>To improve our website and measure our advertising.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>
        Our staff, showrooms and appointed agents; banks and financiers when you ask us to apply for a loan; insurers and JPJ/Puspakom when completing your
        purchase; and service providers that host our systems (such as Google Workspace and Vercel). We do not sell your personal data.
      </p>
      <h2>Your choices and rights</h2>
      <p>
        Providing your data is voluntary, but without a phone number we cannot reply to you. You may request access to or correction of your personal data, or
        ask us to stop contacting you, by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We may charge a fee for data access requests as
        allowed by the PDPA.
      </p>
      <h2>Retention and security</h2>
      <p>We keep enquiry records only as long as needed for the purposes above and for legal and accounting requirements, and protect them with access controls.</p>
      <h2>Bahasa Malaysia</h2>
      <p>Versi Bahasa Malaysia notis ini boleh didapati atas permintaan. Sekiranya terdapat percanggahan, versi Bahasa Inggeris akan diguna pakai.</p>
    </ProsePage>
  );
}

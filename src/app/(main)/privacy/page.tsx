import type { Metadata } from "next";
import { ProsePage } from "@/components/site/Prose";
import { BRAND, CONTACT_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy (PDPA)",
  description: `How ${BRAND} collects and uses personal data through this website.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" path="/privacy" intro="Privacy notice for the RecondHub platform. Last updated 7 October 2026.">
      <h2>About this platform</h2>
      <p>
        {BRAND} is a brand and online automotive platform focused on reconditioned vehicle listings and enquiries in Malaysia. References to &ldquo;{BRAND}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo; in this notice refer to the operator of the {BRAND} platform. {BRAND} does not represent itself as an incorporated company unless expressly stated otherwise.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Information you voluntarily provide through website forms or WhatsApp, such as your name, phone number, state, preferred viewing date and time, vehicle interests, trade-in details and information you provide for loan-related enquiries.</li>
        <li>Information associated with your enquiry, such as the page or vehicle you enquired about, campaign tags (UTM parameters) and, where applicable, an agent or referral identifier.</li>
        <li>Basic website usage and analytics information where analytics or advertising measurement tools are enabled.</li>
      </ul>
      <h2>Why we use it</h2>
      <ul>
        <li>To respond to enquiries and assist with vehicle viewing, sourcing, financing or trade-in requests.</li>
        <li>To route an enquiry to an appropriate sales contact, agent or vehicle source where necessary.</li>
        <li>To operate, secure and improve the website and understand the effectiveness of our marketing.</li>
      </ul>
      <h2>Who we may share it with</h2>
      <p>
        Information may be shared only where reasonably necessary to handle your request, including with relevant sales contacts, vehicle dealers or showrooms, appointed agents, banks or financiers when financing is requested, and technology service providers used to operate the platform. We do not sell your personal data.
      </p>
      <h2>Your choices</h2>
      <p>
        Providing information through this website is voluntary. You may request access to or correction of personal data held about you, withdraw a marketing request, or ask us to stop contacting you by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <h2>Retention and security</h2>
      <p>
        Enquiry information is retained only for as long as reasonably necessary for the purpose for which it was collected and any applicable legal or administrative requirements. Reasonable access controls and security measures are used to protect information handled through the platform.
      </p>
      <h2>Third-party services</h2>
      <p>
        The website may use third-party services for hosting, analytics, communications and other operational functions. Those services may process information in accordance with their own terms and privacy practices.
      </p>
      <h2>Contact</h2>
      <p>
        For privacy enquiries relating to the {BRAND} platform, contact <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </ProsePage>
  );
}

"use client";

import { useState } from "react";
import { useSettings } from "@/components/site/SiteProvider";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/leads/client";
import { normalizeMsisdn } from "@/lib/whatsapp";

const BUDGETS = ["RM 1m – 2m", "RM 2m – 3m", "RM 3m – 5m", "RM 5m+", "Prefer to discuss"];
const TIMELINES = ["As soon as possible", "1 – 3 months", "3 – 6 months", "6 – 12 months", "Flexible"];
const CONTACT_TIMES = ["Morning", "Afternoon", "Evening", "Any time"];

export function PrivateSourcingForm() {
  const settings = useSettings();
  const [f, setF] = useState({ car: "", spec: "", budget: "", timeline: "", name: "", phone: "", contact: "Any time", website: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!f.car.trim()) return setError("Please tell us the make and model.");
    if (!f.name.trim() || !normalizeMsisdn(f.phone)) return setError("Please enter your name and a valid phone number.");
    setError("");
    setBusy(true);
    const message = [
      "Private Sourcing request",
      `Car: ${f.car}`,
      f.spec && `Spec / colour: ${f.spec}`,
      f.budget && `Budget: ${f.budget}`,
      f.timeline && `Timeline: ${f.timeline}`,
      `Name: ${f.name}, ${f.phone}`,
      `Best time to contact: ${f.contact}`,
    ]
      .filter(Boolean)
      .join("\n");
    await submitLead(
      {
        type: "private_sourcing",
        name: f.name,
        phone: f.phone,
        preferred_time: f.contact,
        website: f.website,
        details: { car: f.car, spec: f.spec, budget: f.budget, timeline: f.timeline },
      },
      message,
      settings.ownerWhatsapp,
    );
    track("submit_private_sourcing", { agent: "OWNER" });
    setBusy(false);
    setSent(true);
  };

  if (sent)
    return (
      <p role="status" className="mt-10 border-l-2 border-champagne pl-4 font-serif text-2xl text-[#f7f1e3]">
        Thank you. Our owner will be in touch personally.
      </p>
    );

  const L = "block text-xs font-semibold uppercase tracking-[0.18em] text-[#8c826f]";
  return (
    <form onSubmit={submit} noValidate className="mt-10 grid gap-8 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className={L}>Make & model</span>
        <input className="field-dark" value={f.car} onChange={up("car")} placeholder="Ferrari 296 GTB" required />
      </label>
      <label className="sm:col-span-2">
        <span className={L}>Specification & colour</span>
        <textarea className="field-dark min-h-20 resize-y" value={f.spec} onChange={up("spec")} placeholder="Rosso Corsa, carbon pack, Assetto Fiorano…" />
      </label>
      <label>
        <span className={L}>Budget</span>
        <select className="field-dark" value={f.budget} onChange={up("budget")}>
          <option value="">Select</option>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={L}>Timeline</span>
        <select className="field-dark" value={f.timeline} onChange={up("timeline")}>
          <option value="">Select</option>
          {TIMELINES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={L}>Name</span>
        <input className="field-dark" autoComplete="name" value={f.name} onChange={up("name")} required />
      </label>
      <label>
        <span className={L}>Phone</span>
        <input className="field-dark" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={up("phone")} required />
      </label>
      <label>
        <span className={L}>Preferred contact time</span>
        <select className="field-dark" value={f.contact} onChange={up("contact")}>
          {CONTACT_TIMES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="hidden" aria-hidden>
        Website
        <input tabIndex={-1} autoComplete="off" value={f.website} onChange={up("website")} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-300 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="btn min-w-56 bg-champagne px-8 text-night hover:bg-[#d8b870]">
          {busy ? "Opening WhatsApp…" : "Send privately via WhatsApp"}
        </button>
      </div>
    </form>
  );
}

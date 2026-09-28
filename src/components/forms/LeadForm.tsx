"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { useSettings } from "@/components/site/SiteProvider";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { track, type TrackEvent } from "@/lib/analytics";
import { submitLead } from "@/lib/leads/client";
import type { LeadType } from "@/lib/leads/types";
import { STATES } from "@/lib/states";
import { normalizeMsisdn } from "@/lib/whatsapp";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "tel" | "select" | "textarea" | "year";
  options?: string[] | "states";
  required?: boolean;
  placeholder?: string;
  half?: boolean;
  autoComplete?: string;
};

type Kind = "find_me_a_car" | "agent_application";

const CONFIG: Record<Kind, { type: LeadType; event: TrackEvent; title: string; submit: string }> = {
  find_me_a_car: { type: "find_me_a_car", event: "submit_find_me_a_car", title: "Find me a car", submit: "Send my request on WhatsApp" },
  agent_application: { type: "agent_application", event: "submit_agent_application", title: "Agent application", submit: "Apply on WhatsApp" },
};

const LEAD_COLUMNS = new Set(["name", "phone", "state", "car_code", "showroom_id", "preferred_date", "preferred_time"]);

/**
 * Config-driven lead form. Query params with the same name as a field prefill it (e.g. /find-me-a-car?make=Toyota).
 * Known lead columns go to their own sheet column, everything else into details_json.
 */
export function LeadForm({ kind, fields }: { kind: Kind; fields: Field[] }) {
  const cfg = CONFIG[kind];
  const settings = useSettings();
  const params = useSearchParams();
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.name, params.get(f.name) ?? ""])));
  const [hp, setHp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !values[f.name]?.trim());
    if (missing) return setError(`Please fill in ${missing.label.toLowerCase()}.`);
    if (values.phone !== undefined && !normalizeMsisdn(values.phone)) return setError("Please enter a valid Malaysian phone number.");
    setError("");
    setBusy(true);
    const stateName = STATES.find((s) => s.slug === values.state)?.name ?? values.state;
    const lines = [`Hi, ${cfg.title}:`, ...fields.filter((f) => values[f.name]?.trim()).map((f) => `${f.label}: ${f.name === "state" ? stateName : values[f.name].trim()}`)];
    const details = Object.fromEntries(Object.entries(values).filter(([k, v]) => !LEAD_COLUMNS.has(k) && v.trim()));
    const columns = Object.fromEntries(Object.entries(values).filter(([k]) => LEAD_COLUMNS.has(k)));
    const routed = await submitLead({ type: cfg.type, ...columns, details, website: hp }, lines.join("\n"), settings.hqWhatsapp);
    track(cfg.event, { state: values.state, agent: routed.assigned_to });
    setBusy(false);
    setDone(true);
  };

  if (done)
    return (
      <div role="status" className="rounded-xl border border-line bg-card p-6">
        <p className="font-serif text-2xl">Thank you. We&rsquo;ve received your request.</p>
        <p className="mt-1 text-ink-2">If WhatsApp didn&rsquo;t open, message us and mention your name so we can match it.</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-xl border border-line bg-card p-5 sm:grid-cols-2 sm:p-6">
      {fields.map((f) => {
        const fid = `${id}-${f.name}`;
        const common = {
          id: fid,
          name: f.name,
          value: values[f.name] ?? "",
          required: f.required,
          placeholder: f.placeholder,
          autoComplete: f.autoComplete,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [f.name]: e.target.value })),
        };
        const options = f.options === "states" ? STATES.map((s) => ({ value: s.slug, label: s.name })) : (f.options ?? []).map((o) => ({ value: o, label: o }));
        return (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={fid} className="label">
              {f.label}
              {f.required ? "" : <span className="font-normal text-muted"> (optional)</span>}
            </label>
            {f.type === "select" ? (
              <select className="field" {...common}>
                <option value="">Select</option>
                {options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea className="field min-h-24" {...common} />
            ) : (
              <input
                className="field"
                type={f.type === "tel" ? "tel" : "text"}
                inputMode={f.type === "tel" ? "tel" : f.type === "year" ? "numeric" : undefined}
                maxLength={f.type === "year" ? 4 : undefined}
                {...common}
              />
            )}
          </div>
        );
      })}
      <label className="hidden" aria-hidden>
        Website
        <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-wa w-full sm:w-auto" disabled={busy}>
          <WhatsAppIcon /> {busy ? "Opening WhatsApp…" : cfg.submit}
        </button>
        <p className="mt-2 text-xs text-muted">
          By submitting you agree to our{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

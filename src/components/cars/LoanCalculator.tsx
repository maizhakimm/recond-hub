"use client";

import { useId, useRef, useState } from "react";
import { useSettings } from "@/components/site/SiteProvider";
import { track } from "@/lib/analytics";
import { calcDsr, calcLoan, eligibility, type Eligibility } from "@/lib/loan";
import { formatRM } from "@/lib/format";
import { submitLead } from "@/lib/leads/client";
import { WhatsAppIcon } from "@/components/ui/Icons";

const ELIG_COPY: Record<Eligibility, { label: string; cls: string; note: string }> = {
  likely: { label: "Likely eligible", cls: "bg-emerald-100 text-emerald-900", note: "Your commitments look comfortable for most banks." },
  borderline: { label: "Borderline", cls: "bg-amber-100 text-amber-900", note: "A bigger down payment or longer tenure may help. Our team can check with several banks." },
  unlikely: { label: "Unlikely for now", cls: "bg-red-100 text-red-900", note: "Try a lower price, bigger down payment, or talk to us about a guarantor." },
};

function num(v: string): number {
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function LoanCalculator({
  price: initialPrice,
  car,
}: {
  price?: number;
  car?: { code: string; label: string; stateSlug: string };
}) {
  const s = useSettings();
  const id = useId();
  const [price, setPrice] = useState(initialPrice ? String(initialPrice) : "150000");
  const [dpMode, setDpMode] = useState<"pct" | "rm">("pct");
  const [dp, setDp] = useState(String(s.minDownpaymentPct));
  const [rate, setRate] = useState(String(s.defaultInterestRate));
  const [years, setYears] = useState(s.maxTenureYears);
  const [salary, setSalary] = useState("");
  const [commitments, setCommitments] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const touched = useRef(false);

  const priceN = num(price);
  const dpRaw = dpMode === "pct" ? (priceN * num(dp)) / 100 : num(dp);
  const minDp = (priceN * s.minDownpaymentPct) / 100;
  const dpTooLow = dpRaw < minDp - 0.5;
  const dpN = Math.min(priceN, Math.max(dpRaw, minDp));
  const dpPct = priceN ? (dpN / priceN) * 100 : 0;
  const result = calcLoan({ price: priceN, downpayment: dpN, ratePct: num(rate), years });
  const salaryN = num(salary);
  const dsr = salaryN ? calcDsr(salaryN, num(commitments), result.monthly) : undefined;
  const elig = dsr !== undefined ? eligibility(dsr, s) : undefined;

  const onUse = () => {
    if (touched.current) return;
    touched.current = true;
    track("use_calculator", { car_code: car?.code, state: car?.stateSlug });
  };

  const send = async () => {
    setBusy(true);
    const lines = [
      "Hi, I'd like a loan check:",
      car ? `${car.label} · #${car.code}` : undefined,
      `Price ${formatRM(priceN)}, down payment ${formatRM(dpN)} (${dpPct.toFixed(0)}%)`,
      `Rate ${num(rate).toFixed(2)}% flat, ${years} years`,
      `Estimated monthly: ${formatRM(result.monthly)}`,
      salaryN ? `Salary ${formatRM(salaryN)}, commitments ${formatRM(num(commitments))}, DSR ${dsr!.toFixed(0)}% (${ELIG_COPY[elig!].label})` : undefined,
      name ? `Name: ${name}` : undefined,
    ].filter(Boolean);
    const routed = await submitLead(
      {
        type: "loan",
        car_code: car?.code,
        state: car?.stateSlug,
        name,
        details: {
          price: priceN,
          downpayment: Math.round(dpN),
          rate: num(rate),
          years,
          monthly: Math.round(result.monthly),
          salary: salaryN,
          commitments: num(commitments),
          dsr: dsr !== undefined ? Math.round(dsr) : "",
          eligibility: elig ?? "",
        },
      },
      lines.join("\n"),
      s.hqWhatsapp,
    );
    track("submit_loan_check", { car_code: car?.code, state: car?.stateSlug, agent: routed.assigned_to });
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-line bg-card p-4 sm:p-6" onInput={onUse}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor={`${id}-price`}>
              Car price (RM)
            </label>
            <input id={`${id}-price`} className="field tnum" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <div className="flex items-end justify-between">
              <label className="label" htmlFor={`${id}-dp`}>
                Down payment {dpMode === "pct" ? "(%)" : "(RM)"}
              </label>
              <div className="mb-1 inline-flex rounded-md border border-line text-xs" role="group" aria-label="Down payment unit">
                {(["pct", "rm"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={dpMode === m}
                    className={`min-h-8 px-3 ${dpMode === m ? "bg-ink text-paper" : ""}`}
                    onClick={() => {
                      setDpMode(m);
                      setDp(m === "pct" ? dpPct.toFixed(0) : String(Math.round(dpN)));
                    }}
                  >
                    {m === "pct" ? "%" : "RM"}
                  </button>
                ))}
              </div>
            </div>
            <input id={`${id}-dp`} className="field tnum" inputMode="decimal" value={dp} onChange={(e) => setDp(e.target.value)} aria-describedby={`${id}-dp-hint`} />
            <p id={`${id}-dp-hint`} className={`mt-1 text-xs ${dpTooLow ? "text-red-700" : "text-muted"}`}>
              Minimum {s.minDownpaymentPct}% ({formatRM(minDp)}){dpTooLow ? ", calculated at the minimum" : ""}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor={`${id}-rate`}>
                Interest (% flat p.a.)
              </label>
              <input id={`${id}-rate`} className="field tnum" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor={`${id}-years`}>
                Tenure: <span className="tnum">{years}</span> years
              </label>
              <input
                id={`${id}-years`}
                type="range"
                min={1}
                max={s.maxTenureYears}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="h-11 w-full accent-[#8a6a2b]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-ink p-5 text-paper">
            <p className="text-sm text-[#c5cad3]">Estimated monthly instalment</p>
            <p className="mt-1 text-4xl font-bold tnum" aria-live="polite">
              {formatRM(result.monthly)}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm tnum">
              <dt className="text-[#c5cad3]">Loan amount</dt>
              <dd className="text-right">{formatRM(result.loan)}</dd>
              <dt className="text-[#c5cad3]">Total interest</dt>
              <dd className="text-right">{formatRM(result.totalInterest)}</dd>
              <dt className="text-[#c5cad3]">Total payable</dt>
              <dd className="text-right">{formatRM(result.totalPayable)}</dd>
            </dl>
          </div>
          <p className="text-xs text-muted">
            Estimate only, using the Malaysian flat-rate hire purchase formula. Actual rates, tenure and approval depend on the bank and your credit profile.
          </p>
        </div>
      </div>

      <fieldset className="mt-6 border-t border-line pt-5">
        <legend className="text-xl font-semibold">Can I get this loan?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor={`${id}-salary`}>
              Gross monthly salary (RM)
            </label>
            <input id={`${id}-salary`} className="field tnum" inputMode="numeric" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 12000" />
          </div>
          <div>
            <label className="label" htmlFor={`${id}-commit`}>
              Existing monthly commitments (RM)
            </label>
            <input id={`${id}-commit`} className="field tnum" inputMode="numeric" value={commitments} onChange={(e) => setCommitments(e.target.value)} placeholder="Home, car, PTPTN, cards" />
          </div>
          <div aria-live="polite">
            <p className="label">Estimated DSR</p>
            {elig ? (
              <div>
                <p className="flex items-center gap-2">
                  <span className="text-2xl font-bold tnum">{dsr!.toFixed(0)}%</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ELIG_COPY[elig].cls}`}>{ELIG_COPY[elig].label}</span>
                </p>
                <p className="mt-1 text-xs text-ink-2">{ELIG_COPY[elig].note}</p>
              </div>
            ) : (
              <p className="text-sm text-muted">Enter your salary to see it.</p>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          DSR = (existing commitments + this instalment) ÷ gross salary. Below {s.dsrEligibleMax}% is usually fine, {s.dsrEligibleMax}–{s.dsrBorderlineMax}% is borderline.
        </p>
      </fieldset>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:flex-1">
          <label className="label" htmlFor={`${id}-name`}>
            Your name (optional)
          </label>
          <input id={`${id}-name`} className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="button" className="btn btn-wa" onClick={send} disabled={busy || !priceN}>
          <WhatsAppIcon /> {busy ? "Opening WhatsApp…" : "Send this to WhatsApp"}
        </button>
      </div>
    </div>
  );
}

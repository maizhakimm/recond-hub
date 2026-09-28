"use client";

import { useMemo, useState } from "react";
import { useSettings } from "@/components/site/SiteProvider";
import { Modal } from "@/components/ui/Modal";
import { CalculatorIcon, CalendarIcon, SwapIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { formatDateLong } from "@/lib/format";
import { parseOpeningHours, slotsFor } from "@/lib/hours";
import { submitLead } from "@/lib/leads/client";
import { normalizeMsisdn } from "@/lib/whatsapp";

export type CtaCar = { code: string; make: string; model: string; variant: string; year: number; stateSlug: string };
export type CtaShowroom = { id: string; name: string; stateSlug: string; hours: string };

type Panel = "booking" | "tradein" | null;

function localIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function slotMinutes(label: string) {
  const [hm, ap] = label.split(" ");
  const h = Number(hm.split(":")[0]) % 12;
  return (ap === "PM" ? h + 12 : h) * 60;
}

/** The four CTAs: sidebar block on desktop, sticky bottom bar on phones. All end in WhatsApp. */
export function CarCTAs({ car, showrooms, defaultShowroomId }: { car: CtaCar; showrooms: CtaShowroom[]; defaultShowroomId?: string }) {
  const [panel, setPanel] = useState<Panel>(null);
  const settings = useSettings();
  const label = `${car.make} ${car.model} ${car.year}`;

  const openBooking = () => {
    setPanel("booking");
    track("open_booking", { car_code: car.code, state: car.stateSlug });
  };
  const toLoan = () => {
    const el = document.getElementById("loan");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    el?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  };
  const ask = async () => {
    const routed = await submitLead(
      { type: "whatsapp_enquiry", car_code: car.code, state: car.stateSlug },
      `Hi, I'm interested in ${label} ${car.variant} · #${car.code}\n${window.location.href}`,
      settings.hqWhatsapp,
    );
    track("click_whatsapp", { car_code: car.code, state: car.stateSlug, agent: routed.assigned_to });
  };

  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden gap-2 md:grid">
        <button type="button" className="btn btn-primary w-full text-base" onClick={openBooking}>
          <CalendarIcon /> Book a viewing
        </button>
        <button type="button" className="btn btn-wa w-full" onClick={ask}>
          <WhatsAppIcon /> Ask on WhatsApp
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn btn-outline" onClick={toLoan}>
            <CalculatorIcon /> Calculate loan
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setPanel("tradein")}>
            <SwapIcon /> Trade-in
          </button>
        </div>
      </div>

      {/* Phone: sticky bottom bar, all four CTAs within thumb reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-1.5">
          <button type="button" className="btn btn-primary whitespace-nowrap px-2 text-sm" onClick={openBooking}>
            Book viewing
          </button>
          <button type="button" className="btn btn-wa flex-col gap-0 px-1 py-1 text-[11px]" onClick={ask} aria-label="Ask on WhatsApp">
            <WhatsAppIcon className="h-5 w-5" /> WhatsApp
          </button>
          <button type="button" className="btn flex-col gap-0 border border-line bg-card px-1 py-1 text-[11px]" onClick={toLoan} aria-label="Calculate loan">
            <CalculatorIcon className="h-5 w-5" /> Loan
          </button>
          <button type="button" className="btn flex-col gap-0 border border-line bg-card px-1 py-1 text-[11px]" onClick={() => setPanel("tradein")} aria-label="Value my trade-in">
            <SwapIcon className="h-5 w-5" /> Trade-in
          </button>
        </div>
      </div>

      <Modal open={panel === "booking"} onClose={() => setPanel(null)} title="Book a viewing">
        <BookingForm car={car} showrooms={showrooms} defaultShowroomId={defaultShowroomId} onDone={() => setPanel(null)} />
      </Modal>
      <Modal open={panel === "tradein"} onClose={() => setPanel(null)} title="Value my trade-in">
        <TradeInForm car={car} onDone={() => setPanel(null)} />
      </Modal>
    </>
  );
}

function BookingForm({
  car,
  showrooms,
  defaultShowroomId,
  onDone,
}: {
  car: CtaCar;
  showrooms: CtaShowroom[];
  defaultShowroomId?: string;
  onDone: () => void;
}) {
  const settings = useSettings();
  const [showroomId, setShowroomId] = useState(defaultShowroomId ?? showrooms[0]?.id ?? "");
  const showroom = showrooms.find((s) => s.id === showroomId);
  const week = useMemo(() => parseOpeningHours(showroom?.hours), [showroom?.hours]);

  // Next 14 days that the showroom is open, with today's past slots removed.
  const days = useMemo(() => {
    const now = new Date();
    const out: { iso: string; slots: string[] }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      let slots = slotsFor(week[d.getDay()]);
      if (i === 0) slots = slots.filter((s) => slotMinutes(s) > now.getHours() * 60 + now.getMinutes() + 60);
      if (slots.length) out.push({ iso: localIso(d), slots });
    }
    return out;
  }, [week]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const day = days.find((d) => d.iso === date) ?? days[0];
  const slot = day?.slots.includes(time) ? time : "";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showroom || !day || !slot) return setError("Please pick a showroom, date and time.");
    if (!name.trim()) return setError("Please enter your name.");
    if (!normalizeMsisdn(phone)) return setError("Please enter a valid Malaysian phone number.");
    setError("");
    setBusy(true);
    const message = [
      "Hi, I'd like to book a viewing:",
      `${car.make} ${car.model} ${car.year} · #${car.code}`,
      `Showroom: ${showroom.name}`,
      `${formatDateLong(day.iso)}, ${slot}`,
      `Name: ${name.trim()}, ${phone.trim()}`,
    ].join("\n");
    const routed = await submitLead(
      {
        type: "viewing_booking",
        car_code: car.code,
        name,
        phone,
        state: showroom.stateSlug,
        showroom_id: showroom.id,
        preferred_date: day.iso,
        preferred_time: slot,
      },
      message,
      settings.hqWhatsapp,
    );
    track("submit_booking", { car_code: car.code, state: showroom.stateSlug, agent: routed.assigned_to });
    setBusy(false);
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm text-ink-2">
        {car.make} {car.model} {car.year} · #{car.code}
      </p>
      <div>
        <label className="label" htmlFor="bk-showroom">
          Showroom
        </label>
        <select id="bk-showroom" className="field" value={showroomId} onChange={(e) => setShowroomId(e.target.value)}>
          {showrooms.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <fieldset>
        <legend className="label">Date</legend>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((d) => {
            const dt = new Date(`${d.iso}T00:00:00`);
            const on = d.iso === day?.iso;
            return (
              <button
                key={d.iso}
                type="button"
                aria-pressed={on}
                onClick={() => setDate(d.iso)}
                className={`flex min-h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border text-sm ${on ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
              >
                <span className="text-xs">{dt.toLocaleDateString("en-MY", { weekday: "short" })}</span>
                <span className="text-lg font-semibold tnum">{dt.getDate()}</span>
                <span className="text-xs">{dt.toLocaleDateString("en-MY", { month: "short" })}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Time</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {(day?.slots ?? []).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={s === slot}
              onClick={() => setTime(s)}
              className={`min-h-11 rounded-lg border text-sm tnum ${s === slot ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="bk-name">
            Name
          </label>
          <input id="bk-name" className="field" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="bk-phone">
            Phone
          </label>
          <input id="bk-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="012-345 6789" required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-wa w-full" disabled={busy}>
        <WhatsAppIcon /> {busy ? "Opening WhatsApp…" : "Confirm on WhatsApp"}
      </button>
      <p className="text-xs text-muted">We&rsquo;ll confirm your slot on WhatsApp. By submitting you agree to our privacy policy.</p>
    </form>
  );
}

function TradeInForm({ car, onDone }: { car: CtaCar; onDone: () => void }) {
  const settings = useSettings();
  const [f, setF] = useState({ make: "", model: "", year: "", mileage: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!f.make.trim() || !f.model.trim() || !/^\d{4}$/.test(f.year)) return setError("Please fill in make, model and a 4-digit year.");
    setError("");
    setBusy(true);
    const message = [
      "Hi, I'd like a trade-in valuation:",
      `My car: ${f.year} ${f.make} ${f.model}${f.mileage ? `, ${f.mileage} km` : ""}`,
      `Interested in: ${car.make} ${car.model} ${car.year} · #${car.code}`,
      f.name ? `Name: ${f.name}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const routed = await submitLead(
      { type: "trade_in", car_code: car.code, state: car.stateSlug, name: f.name, details: { make: f.make, model: f.model, year: f.year, mileage: f.mileage } },
      message,
      settings.hqWhatsapp,
    );
    track("submit_trade_in", { car_code: car.code, state: car.stateSlug, agent: routed.assigned_to });
    setBusy(false);
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm text-ink-2">Tell us about your current car. We&rsquo;ll send an estimate on WhatsApp.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="ti-make">
            Make
          </label>
          <input id="ti-make" className="field" placeholder="Honda" value={f.make} onChange={up("make")} required />
        </div>
        <div>
          <label className="label" htmlFor="ti-model">
            Model
          </label>
          <input id="ti-model" className="field" placeholder="City" value={f.model} onChange={up("model")} required />
        </div>
        <div>
          <label className="label" htmlFor="ti-year">
            Year
          </label>
          <input id="ti-year" className="field tnum" inputMode="numeric" maxLength={4} placeholder="2019" value={f.year} onChange={up("year")} required />
        </div>
        <div>
          <label className="label" htmlFor="ti-km">
            Mileage (km)
          </label>
          <input id="ti-km" className="field tnum" inputMode="numeric" placeholder="60000" value={f.mileage} onChange={up("mileage")} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ti-name">
          Name (optional)
        </label>
        <input id="ti-name" className="field" autoComplete="name" value={f.name} onChange={up("name")} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-wa w-full" disabled={busy}>
        <WhatsAppIcon /> {busy ? "Opening WhatsApp…" : "Get my valuation on WhatsApp"}
      </button>
    </form>
  );
}

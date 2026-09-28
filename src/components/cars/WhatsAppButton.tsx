"use client";

import { useState } from "react";
import { useSettings } from "@/components/site/SiteProvider";
import { track } from "@/lib/analytics";
import { submitLead } from "@/lib/leads/client";
import { WhatsAppIcon } from "@/components/ui/Icons";

/** Logs a whatsapp_enquiry lead (for routing + reporting), then opens WhatsApp with a pre-filled message. */
export function WhatsAppButton({
  message,
  carCode,
  state,
  label = "WhatsApp",
  className = "btn btn-wa",
  ariaLabel,
  agentId,
  showroomId,
}: {
  message: string;
  carCode?: string;
  state?: string;
  label?: string;
  className?: string;
  ariaLabel?: string;
  /** Send straight to this agent / showroom instead of the routing rotation. */
  agentId?: string;
  showroomId?: string;
}) {
  const settings = useSettings();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const routed = await submitLead(
          {
            type: "whatsapp_enquiry",
            car_code: carCode,
            state,
            ...(agentId ? { agent_id: agentId, direct: "agent" as const } : {}),
            ...(showroomId ? { showroom_id: showroomId, direct: "showroom" as const } : {}),
          },
          `${message}\n${window.location.href}`,
          settings.hqWhatsapp,
        );
        track("click_whatsapp", { car_code: carCode, state, agent: routed.assigned_to });
        setBusy(false);
      }}
    >
      <WhatsAppIcon className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

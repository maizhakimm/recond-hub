# Apps Script for the RecondHub sheet

Files: `Config.gs`, `Menu.gs`, `Escalation.gs`, `Setup.gs`, `appsscript.json`.

## Install

1. Open the Google Sheet → **Extensions → Apps Script**.
2. Create one file per `.gs` file here and paste the contents. In **Project Settings**, tick
   "Show appsscript.json" and paste `appsscript.json`.
3. **Project Settings → Script Properties**: add `SITE_URL`, `REVALIDATE_SECRET`, `ESCALATION_MINUTES`
   and `HQ_EMAIL` (optional: `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN`, `HQ_WHATSAPP`). See `Config.gs`.
4. Reload the sheet. Use **RecondHub → Install triggers (run once)** and approve the permissions.

## What it does

- **RecondHub → 🔄 Refresh website**: calls `/api/revalidate` so edits appear immediately
  (otherwise the site refreshes by itself every 5 minutes).
- **Stock auto-dates**: setting `status` to `Sold` fills `sold_date` (the site uses it to show the
  Sold badge for 7 days and redirect the page after 30). Typing a new `code` fills `date_added`.
- **Escalation** (every 15 minutes): leads still `New` after `ESCALATION_MINUTES` get highlighted,
  stamped in an `escalated_at` column, and emailed to `HQ_EMAIL`.

## WhatsApp escalation

Apps Script cannot send WhatsApp messages by itself. If you use a WhatsApp gateway (WhatsApp Cloud API
behind your own small endpoint, or a provider such as Twilio / WATI / a Malaysian SMS-WhatsApp gateway),
point `WHATSAPP_WEBHOOK_URL` at an endpoint that accepts `POST {"to": "60…", "text": "…"}`.
Email escalation works without any of this.

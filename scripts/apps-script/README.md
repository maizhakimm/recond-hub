# Apps Script for the RecondHub sheet

Files: `Config.gs`, `Menu.gs`, `Photos.gs`, `Escalation.gs`, `Setup.gs`, `appsscript.json`.

## Install

1. Open the Google Sheet → **Extensions → Apps Script**.
2. Create one file per `.gs` file here and paste the contents. In **Project Settings**, tick
   "Show appsscript.json" and paste `appsscript.json`.
3. **Project Settings → Script Properties**: add `SITE_URL`, `REVALIDATE_SECRET`, `ESCALATION_MINUTES`
   `HQ_EMAIL` and `PHOTOS_FOLDER_ID` (optional: `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_TOKEN`, `HQ_WHATSAPP`). See `Config.gs`.
4. Reload the sheet. Use **RecondHub → Install triggers (run once)** and approve the permissions.

## What it does

- **RecondHub → 🔄 Refresh website**: calls `/api/revalidate` so edits appear immediately
  (otherwise the site refreshes by itself every 5 minutes).
- **Stock auto-dates**: setting `status` to `Sold` fills `sold_date` (the site uses it to show the
  Sold badge for 7 days and redirect the page after 30). Typing a new `code` fills `date_added`.
- **Photo folders**: typing a new `code` creates a Drive folder `RH121 - Toyota Alphard 2021`
  inside `PHOTOS_FOLDER_ID` (shared "anyone with the link can view") and puts its link in a
  `photo_folder` column. Staff just drop photos in, named 01, 02, … (01 = cover).
- **Photo sync** (every 10 minutes, and before every Refresh): fills `photos` with the folder's images
  in file-name order and `auction_sheet_url` with any file named "auction…". Menu items:
  **📁 Create photo folders for all cars** (for rows added before the script) and **🖼️ Sync photos now**.
- **Escalation** (every 15 minutes): leads still `New` after `ESCALATION_MINUTES` get highlighted,
  stamped in an `escalated_at` column, and emailed to `HQ_EMAIL`.

## WhatsApp escalation

Apps Script cannot send WhatsApp messages by itself. If you use a WhatsApp gateway (WhatsApp Cloud API
behind your own small endpoint, or a provider such as Twilio / WATI / a Malaysian SMS-WhatsApp gateway),
point `WHATSAPP_WEBHOOK_URL` at an endpoint that accepts `POST {"to": "60…", "text": "…"}`.
Email escalation works without any of this.

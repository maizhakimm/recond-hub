/**
 * RecondHub Apps Script: configuration.
 *
 * Set these in Extensions → Apps Script → Project Settings → Script Properties
 * (never paste secrets into the code):
 *
 *   SITE_URL              https://recondhub.com.my          (no trailing slash)
 *   REVALIDATE_SECRET     same value as the REVALIDATE_SECRET env var on Vercel
 *   ESCALATION_MINUTES    15                                 (flag New leads older than this)
 *   HQ_EMAIL              hq@recondhub.my, owner@recondhub.my (comma-separated)
 *   WHATSAPP_WEBHOOK_URL  optional: a WhatsApp gateway endpoint that accepts POST {"to","text"}
 *   WHATSAPP_WEBHOOK_TOKEN optional: sent as "Authorization: Bearer <token>"
 *   HQ_WHATSAPP           optional: 60XXXXXXXXX to receive escalation WhatsApps
 *   PHOTOS_FOLDER_ID      id of the Drive folder where per-car photo folders are created
 *                         (the "1. Gambar Stok Kereta" folder; id = last part of its URL)
 */
function getConfig_() {
  var p = PropertiesService.getScriptProperties().getProperties();
  return {
    siteUrl: (p.SITE_URL || '').replace(/\/$/, ''),
    secret: p.REVALIDATE_SECRET || '',
    escalationMinutes: Number(p.ESCALATION_MINUTES || 15),
    hqEmail: p.HQ_EMAIL || '',
    waWebhook: p.WHATSAPP_WEBHOOK_URL || '',
    waToken: p.WHATSAPP_WEBHOOK_TOKEN || '',
    hqWhatsapp: p.HQ_WHATSAPP || '',
  };
}

/** Returns { headerName: columnIndex (1-based) } for a sheet's first row. */
function headerMap_(sheet) {
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  header.forEach(function (h, i) {
    var key = String(h).trim().toLowerCase();
    if (key) map[key] = i + 1;
  });
  return map;
}

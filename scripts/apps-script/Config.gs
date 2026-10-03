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

/**
 * Friendly BM column names ↔ internal keys. Generated from src/lib/data/columns.ts; keep them in sync.
 * A header may be either the BM label ("Harga (RM)") or the key ("price_rm").
 */
var COLUMN_LABELS = {
  "Stock": {
    "code": "Kod Kereta",
    "status": "Status",
    "make": "Jenama",
    "model": "Model",
    "variant": "Varian",
    "year_manufactured": "Tahun Dibuat",
    "year_registered": "Tahun Daftar",
    "body_type": "Jenis Badan",
    "price_rm": "Harga (RM)",
    "mileage_km": "Mileage (km)",
    "grade": "Gred Auction",
    "engine_cc": "Enjin (cc)",
    "transmission": "Gear",
    "fuel": "Minyak",
    "colour": "Warna",
    "seats": "Tempat Duduk",
    "drivetrain": "Pacuan",
    "showroom_id": "Showroom",
    "state": "Negeri",
    "highlights": "Kelebihan Lain",
    "description": "Penerangan",
    "featured": "Tonjol di Laman Utama",
    "date_added": "Tarikh Masuk",
    "sold_date": "Tarikh Jual",
    "photo_folder": "Folder Gambar",
    "photos": "Gambar (auto)",
    "auction_sheet_url": "Auction Sheet (auto)",
    "sunroof": "Sunroof",
    "moonroof": "Moonroof / Panoramic",
    "power_doors": "Pintu Elektrik",
    "power_boot": "Bonet Elektrik",
    "pilot_seats": "Pilot Seat",
    "leather_seats": "Kerusi Kulit",
    "camera_360": "Kamera 360",
    "rear_monitor": "Skrin Belakang",
    "head_up_display": "Head-Up Display",
    "premium_audio": "Audio Premium",
    "carplay": "Apple CarPlay / Android Auto",
    "adaptive_cruise": "Adaptive Cruise"
  },
  "Showrooms": {
    "showroom_id": "Kod Showroom",
    "name": "Nama",
    "state": "Negeri",
    "city": "Bandar",
    "address": "Alamat",
    "google_maps_url": "Pautan Google Maps",
    "whatsapp": "WhatsApp",
    "opening_hours": "Waktu Operasi",
    "photo": "Gambar"
  },
  "Agents": {
    "agent_id": "Kod Agen",
    "name": "Nama",
    "state": "Negeri",
    "showroom_id": "Showroom",
    "whatsapp": "WhatsApp",
    "photo": "Gambar",
    "active": "Aktif"
  },
  "Settings": {
    "hq_whatsapp": "WhatsApp HQ",
    "owner_whatsapp": "WhatsApp Owner",
    "default_interest_rate": "Kadar Faedah (%)",
    "max_tenure_years": "Tempoh Maksimum (tahun)",
    "min_downpayment_pct": "Deposit Minimum (%)",
    "dsr_eligible_max": "Had Layak Pinjaman (%)",
    "dsr_borderline_max": "Had Sempadan Pinjaman (%)"
  },
  "Leads": {
    "timestamp": "Masa",
    "type": "Jenis",
    "car_code": "Kod Kereta",
    "name": "Nama",
    "phone": "Telefon",
    "state": "Negeri",
    "showroom_id": "Showroom",
    "preferred_date": "Tarikh Pilihan",
    "preferred_time": "Masa Pilihan",
    "details_json": "Maklumat Tambahan",
    "assigned_to": "Diserah Kepada",
    "source_page": "Halaman",
    "utm_source": "Sumber Iklan",
    "utm_campaign": "Kempen Iklan",
    "status": "Status",
    "escalated_at": "Amaran Dihantar"
  }
};

function normHeader_(s) {
  return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Internal key for a header in a given tab. */
function canonicalKey_(tab, header) {
  var cols = COLUMN_LABELS[tab] || {};
  var n = normHeader_(header);
  for (var key in cols) {
    if (normHeader_(key) === n || normHeader_(cols[key]) === n) return key;
  }
  return String(header).trim().toLowerCase();
}

/** Friendly label to use when the script adds a column. */
function columnLabel_(tab, key) {
  return (COLUMN_LABELS[tab] || {})[key] || key;
}

/** Returns { internalKey: columnIndex (1-based) } for a sheet's first row. */
function headerMap_(sheet) {
  var tab = sheet.getName();
  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  header.forEach(function (h, i) {
    if (String(h).trim()) map[canonicalKey_(tab, h)] = i + 1;
  });
  return map;
}

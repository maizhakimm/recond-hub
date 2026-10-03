/**
 * Friendly (Bahasa Malaysia) column names for the Google Sheet, mapped to the internal keys the code uses.
 * The sheet may use either the friendly label or the internal key as a header; both work.
 * Keep this in sync with scripts/apps-script/Config.gs (COLUMN_LABELS).
 */

/** Car features shown as tick boxes in the sheet, as a list on the car page, and as filters. */
export const FEATURES = [
  { key: "sunroof", label: "Sunroof" },
  { key: "moonroof", label: "Moonroof / Panoramic" },
  { key: "power_doors", label: "Pintu Elektrik" },
  { key: "power_boot", label: "Bonet Elektrik" },
  { key: "pilot_seats", label: "Pilot Seat" },
  { key: "leather_seats", label: "Kerusi Kulit" },
  { key: "camera_360", label: "Kamera 360" },
  { key: "rear_monitor", label: "Skrin Belakang" },
  { key: "head_up_display", label: "Head-Up Display" },
  { key: "premium_audio", label: "Audio Premium" },
  { key: "carplay", label: "Apple CarPlay / Android Auto" },
  { key: "adaptive_cruise", label: "Adaptive Cruise" },
] as const;
export type FeatureKey = (typeof FEATURES)[number]["key"];

/** English names used on the website (the site is in English; the sheet is in BM). */
export const FEATURE_NAMES_EN: Record<FeatureKey, string> = {
  sunroof: "Sunroof",
  moonroof: "Moonroof / panoramic roof",
  power_doors: "Power sliding doors",
  power_boot: "Power boot",
  pilot_seats: "Pilot seats",
  leather_seats: "Leather seats",
  camera_360: "360° camera",
  rear_monitor: "Rear entertainment screen",
  head_up_display: "Head-up display",
  premium_audio: "Premium audio",
  carplay: "Apple CarPlay / Android Auto",
  adaptive_cruise: "Adaptive cruise control",
};

export const COLUMN_LABELS = {
  Stock: {
    code: "Kod Kereta",
    status: "Status",
    make: "Jenama",
    model: "Model",
    variant: "Varian",
    year_manufactured: "Tahun Dibuat",
    year_registered: "Tahun Daftar",
    body_type: "Jenis Badan",
    price_rm: "Harga (RM)",
    mileage_km: "Mileage (km)",
    grade: "Gred Auction",
    engine_cc: "Enjin (cc)",
    transmission: "Gear",
    fuel: "Minyak",
    colour: "Warna",
    seats: "Tempat Duduk",
    drivetrain: "Pacuan",
    ...Object.fromEntries(FEATURES.map((f) => [f.key, f.label])),
    showroom_id: "Showroom",
    state: "Negeri",
    highlights: "Kelebihan Lain",
    description: "Penerangan",
    featured: "Tonjol di Laman Utama",
    date_added: "Tarikh Masuk",
    sold_date: "Tarikh Jual",
    photo_folder: "Folder Gambar",
    photos: "Gambar (auto)",
    auction_sheet_url: "Auction Sheet (auto)",
  },
  Showrooms: {
    showroom_id: "Kod Showroom",
    name: "Nama",
    state: "Negeri",
    city: "Bandar",
    address: "Alamat",
    google_maps_url: "Pautan Google Maps",
    whatsapp: "WhatsApp",
    opening_hours: "Waktu Operasi",
    photo: "Gambar",
  },
  Agents: {
    agent_id: "Kod Agen",
    name: "Nama",
    state: "Negeri",
    showroom_id: "Showroom",
    whatsapp: "WhatsApp",
    photo: "Gambar",
    active: "Aktif",
  },
  Settings: {
    hq_whatsapp: "WhatsApp HQ",
    owner_whatsapp: "WhatsApp Owner",
    default_interest_rate: "Kadar Faedah (%)",
    max_tenure_years: "Tempoh Maksimum (tahun)",
    min_downpayment_pct: "Deposit Minimum (%)",
    dsr_eligible_max: "Had Layak Pinjaman (%)",
    dsr_borderline_max: "Had Sempadan Pinjaman (%)",
  },
  Leads: {
    timestamp: "Masa",
    type: "Jenis",
    car_code: "Kod Kereta",
    name: "Nama",
    phone: "Telefon",
    state: "Negeri",
    showroom_id: "Showroom",
    preferred_date: "Tarikh Pilihan",
    preferred_time: "Masa Pilihan",
    details_json: "Maklumat Tambahan",
    assigned_to: "Diserah Kepada",
    source_page: "Halaman",
    utm_source: "Sumber Iklan",
    utm_campaign: "Kempen Iklan",
    status: "Status",
  },
} as const;

export type TabName = keyof typeof COLUMN_LABELS;

/** "Harga (RM)" → "hargarm", "price_rm" → "pricerm". */
function norm(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const LOOKUP: Record<string, Map<string, string>> = {};
for (const [tab, cols] of Object.entries(COLUMN_LABELS)) {
  const m = new Map<string, string>();
  for (const [key, label] of Object.entries(cols)) {
    m.set(norm(key), key);
    m.set(norm(label), key);
  }
  LOOKUP[tab] = m;
}

/** Map a sheet header (friendly label or internal key) to the internal key. Unknown headers pass through lower-cased. */
export function canonicalKey(tab: string, header: string): string {
  return LOOKUP[tab]?.get(norm(header)) ?? header.trim().toLowerCase();
}

/** Friendly BM names for lead types, written to the Leads tab. */
export const LEAD_TYPE_LABELS: Record<string, string> = {
  whatsapp_enquiry: "Tanya WhatsApp",
  viewing_booking: "Tempah Tontonan",
  loan: "Kira Pinjaman",
  trade_in: "Trade-in",
  find_me_a_car: "Cari Kereta",
  private_sourcing: "Private Sourcing",
  agent_application: "Mohon Jadi Agen",
};

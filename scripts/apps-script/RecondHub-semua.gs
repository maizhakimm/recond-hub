// RecondHub: semua skrip dalam satu fail. Salin SEMUA dan tampal dalam Apps Script (Code.gs).

// ===== Config.gs =====
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

// ===== Photos.gs =====
/**
 * Photo folders, driven by the Stock tab.
 *
 * - Type a car code in Stock → a Drive folder "RH121 - Toyota Alphard 2021" is created inside
 *   PHOTOS_FOLDER_ID, shared "anyone with the link can view", and its link goes in `photo_folder`.
 * - Staff drop photos into that folder. Nothing to rename, no links to copy.
 * - syncPhotos() (every 10 minutes, and before every "Refresh website") fills `photos` with the
 *   folder's images sorted by file name (01, 02, … first = cover) and `auction_sheet_url` with any
 *   file whose name contains "auction".
 *
 * Script Property: PHOTOS_FOLDER_ID = id of the "1. Gambar Stok Kereta" folder
 * (the long id at the end of the folder's URL).
 */

var PHOTO_FOLDER_COL = 'photo_folder';

function photosRoot_() {
  var id = PropertiesService.getScriptProperties().getProperty('PHOTOS_FOLDER_ID');
  if (!id) throw new Error('Set the PHOTOS_FOLDER_ID script property (the "1. Gambar Stok Kereta" folder id).');
  return DriveApp.getFolderById(id);
}

/** Make sure the Stock tab has a photo_folder column; returns the refreshed header map. */
function ensurePhotoColumn_(sheet) {
  var cols = headerMap_(sheet);
  if (!cols[PHOTO_FOLDER_COL]) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue(columnLabel_('Stock', PHOTO_FOLDER_COL));
    cols = headerMap_(sheet);
  }
  return cols;
}

function folderIdFromUrl_(url) {
  var m = String(url || '').match(/folders\/([\w-]{10,})/);
  return m ? m[1] : '';
}

function folderName_(row, cols) {
  var get = function (k) { return cols[k] ? String(row[cols[k] - 1] || '').trim() : ''; };
  return [get('code').toUpperCase(), [get('make'), get('model'), get('year_manufactured')].filter(String).join(' ')]
    .filter(String)
    .join(' - ');
}

/** Create (or reuse) the folder for one Stock row. Returns the folder URL. */
function ensureCarFolder_(sheet, rowNumber, cols) {
  var row = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  var code = String(row[cols.code - 1] || '').trim();
  if (!code) return '';
  var cell = sheet.getRange(rowNumber, cols[PHOTO_FOLDER_COL]);
  var existingId = folderIdFromUrl_(cell.getValue());
  var name = folderName_(row, cols);

  if (existingId) {
    var f = DriveApp.getFolderById(existingId);
    if (f.getName() !== name) f.setName(name); // keep the name in step with make/model edits
    return f.getUrl();
  }
  var root = photosRoot_();
  // Reuse a folder that already starts with this code (e.g. the row was deleted and re-added).
  var it = root.getFolders();
  while (it.hasNext()) {
    var cand = it.next();
    if (cand.getName().split(' - ')[0].toUpperCase() === code.toUpperCase()) {
      cell.setValue(cand.getUrl());
      return cand.getUrl();
    }
  }
  var folder = root.createFolder(name);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // the website needs to read the photos
  cell.setValue(folder.getUrl());
  return folder.getUrl();
}

/** Menu: create folders for every Stock row that has a code but no folder yet. */
function createAllPhotoFolders() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Stock');
  var cols = ensurePhotoColumn_(sheet);
  var n = 0;
  for (var r = 2; r <= sheet.getLastRow(); r++) {
    var before = sheet.getRange(r, cols[PHOTO_FOLDER_COL]).getValue();
    if (ensureCarFolder_(sheet, r, cols) && !before) n++;
  }
  SpreadsheetApp.getActive().toast(n + ' photo folder(s) created.', 'RecondHub', 5);
}

/** Natural sort so 2.jpg comes before 10.jpg. */
function naturalCompare_(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Fill `photos` and `auction_sheet_url` from each car's folder. Only writes cells that changed. */
function syncPhotos() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    var sheet = SpreadsheetApp.getActive().getSheetByName('Stock');
    if (!sheet || sheet.getLastRow() < 2) return;
    var cols = ensurePhotoColumn_(sheet);
    var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    var changed = 0;

    data.forEach(function (row, i) {
      var r = i + 2;
      if (!row[cols.code - 1]) return;
      var id = folderIdFromUrl_(row[cols[PHOTO_FOLDER_COL] - 1]);
      if (!id) {
        ensureCarFolder_(sheet, r, cols);
        return; // new folder is empty; photos arrive on a later sync
      }
      var files = [];
      var it;
      try {
        it = DriveApp.getFolderById(id).getFiles();
      } catch (err) {
        return; // folder deleted or no access: leave the row as it is
      }
      while (it.hasNext()) {
        var f = it.next();
        if (f.isTrashed() || String(f.getMimeType()).indexOf('image/') !== 0 && f.getMimeType() !== 'application/pdf') continue;
        files.push({ name: f.getName(), url: 'https://drive.google.com/file/d/' + f.getId() + '/view', pdf: f.getMimeType() === 'application/pdf' });
      }
      files.sort(function (a, b) { return naturalCompare_(a.name, b.name); });
      var auction = files.filter(function (f) { return /auction/i.test(f.name); })[0];
      var photos = files.filter(function (f) { return f !== auction && !f.pdf; }).map(function (f) { return f.url; }).join(',');

      if (cols.photos && photos && photos !== String(row[cols.photos - 1])) {
        sheet.getRange(r, cols.photos).setValue(photos);
        changed++;
      }
      if (cols.auction_sheet_url && auction && auction.url !== String(row[cols.auction_sheet_url - 1])) {
        sheet.getRange(r, cols.auction_sheet_url).setValue(auction.url);
        changed++;
      }
    });
    return changed;
  } finally {
    lock.releaseLock();
  }
}

// ===== Menu.gs =====
/**
 * "RecondHub" menu with a Refresh website button, plus automatic dates on the Stock tab.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('RecondHub')
    .addItem('🔄 Refresh website', 'refreshWebsite')
    .addItem('📁 Create photo folders for all cars', 'createAllPhotoFolders')
    .addItem('🖼️ Sync photos now', 'syncPhotosNow')
    .addSeparator()
    .addItem('Install triggers (run once)', 'installTriggers')
    .addToUi();
}

/** Calls /api/revalidate so the website shows sheet changes within seconds instead of 5 minutes. */
function refreshWebsite() {
  var cfg = getConfig_();
  var ui = SpreadsheetApp.getUi();
  if (!cfg.siteUrl || !cfg.secret) {
    ui.alert('Set SITE_URL and REVALIDATE_SECRET in Project Settings → Script Properties first.');
    return;
  }
  try {
    syncPhotos(); // pick up photos dropped into car folders since the last sync
  } catch (err) {
    ui.alert('Photo sync failed (website will still refresh): ' + err.message);
  }
  var res = UrlFetchApp.fetch(cfg.siteUrl + '/api/revalidate?secret=' + encodeURIComponent(cfg.secret), {
    method: 'post',
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() === 200) {
    SpreadsheetApp.getActive().toast('Website refreshed. Changes are live.', 'RecondHub', 5);
  } else {
    ui.alert('Refresh failed (' + res.getResponseCode() + '): ' + res.getContentText());
  }
}

/**
 * Installable onEdit (created by installTriggers):
 *  - Stock: when status becomes "Sold", fill sold_date with today (if empty).
 *           when status changes back from Sold, clear sold_date.
 *  - Stock: when a new code is typed and date_added is empty, fill date_added.
 *  - Stock: when a new code is typed, create its photo folder (see Photos.gs).
 */
function onStockEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (sheet.getName() !== 'Stock' || e.range.getRow() < 2) return;
  var cols = headerMap_(sheet);
  var today = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd');
  var firstRow = e.range.getRow();
  var numRows = e.range.getNumRows();

  for (var r = firstRow; r < firstRow + numRows; r++) {
    if (cols.status && cols.sold_date && e.range.getColumn() <= cols.status && cols.status <= e.range.getLastColumn()) {
      var status = String(sheet.getRange(r, cols.status).getValue()).trim().toLowerCase();
      var soldCell = sheet.getRange(r, cols.sold_date);
      if (status === 'sold' && !soldCell.getValue()) soldCell.setValue(today);
      if (status !== 'sold' && soldCell.getValue()) soldCell.clearContent();
    }
    if (cols.code && e.range.getColumn() <= cols.code && cols.code <= e.range.getLastColumn()) {
      var hasCode = Boolean(sheet.getRange(r, cols.code).getValue());
      if (hasCode && cols.date_added) {
        var addedCell = sheet.getRange(r, cols.date_added);
        if (!addedCell.getValue()) addedCell.setValue(today);
      }
      // New car code → create its photo folder and put the link in photo_folder.
      if (hasCode) {
        try {
          ensureCarFolder_(sheet, r, ensurePhotoColumn_(sheet));
        } catch (err) {
          SpreadsheetApp.getActive().toast('Photo folder not created: ' + err.message, 'RecondHub', 8);
        }
      }
    }
  }
}

/** Menu: sync photos and say how many cells changed. */
function syncPhotosNow() {
  var n = syncPhotos() || 0;
  SpreadsheetApp.getActive().toast('Photos synced (' + n + ' cell(s) updated). Press Refresh website to publish.', 'RecondHub', 6);
}

// ===== Escalation.gs =====
/**
 * Runs every 15 minutes (see installTriggers). Any lead still "New" after ESCALATION_MINUTES
 * is flagged: the row is highlighted, "escalated_at" is stamped, and HQ gets an email
 * (and a WhatsApp, if a gateway is configured). Each lead is escalated once.
 *
 * Staff stop escalation by changing the lead's status (e.g. Contacted, Booked, Lost).
 */
function escalateStaleLeads() {
  var cfg = getConfig_();
  var sheet = SpreadsheetApp.getActive().getSheetByName('Leads');
  if (!sheet || sheet.getLastRow() < 2) return;

  var cols = headerMap_(sheet);
  if (!cols.escalated_at) {
    // Add the tracking column once; the website ignores columns it doesn't know.
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue(columnLabel_('Leads', 'escalated_at'));
    cols = headerMap_(sheet);
  }

  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  var now = Date.now();
  var stale = [];

  values.forEach(function (row, i) {
    var status = String(row[cols.status - 1]).trim().toLowerCase();
    if (status !== 'new' || row[cols.escalated_at - 1]) return;
    var created = parseTimestamp_(row[cols.timestamp - 1]);
    if (!created) return;
    var ageMin = (now - created.getTime()) / 60000;
    if (ageMin < cfg.escalationMinutes) return;
    stale.push({
      rowNumber: i + 2,
      ageMin: Math.round(ageMin),
      type: row[cols.type - 1],
      car: row[cols.car_code - 1],
      name: row[cols.name - 1],
      phone: row[cols.phone - 1],
      state: row[cols.state - 1],
      assigned: row[cols.assigned_to - 1],
    });
  });

  if (!stale.length) return;

  var stamp = Utilities.formatDate(new Date(), 'Asia/Kuala_Lumpur', 'yyyy-MM-dd HH:mm');
  stale.forEach(function (l) {
    sheet.getRange(l.rowNumber, cols.escalated_at).setValue(stamp);
    sheet.getRange(l.rowNumber, 1, 1, sheet.getLastColumn()).setBackground('#fde2e1');
  });

  var lines = stale.map(function (l) {
    return '• Row ' + l.rowNumber + ' · ' + l.type + (l.car ? ' · #' + l.car : '') + ' · ' + (l.name || '(no name)') + ' ' + (l.phone || '') +
      ' · ' + (l.state || '-') + ' · assigned ' + (l.assigned || '-') + ' · waiting ' + l.ageMin + ' min';
  });
  var text = stale.length + ' lead(s) still New after ' + cfg.escalationMinutes + ' minutes:\n' + lines.join('\n') +
    '\n\nOpen the sheet: ' + SpreadsheetApp.getActive().getUrl();

  if (cfg.hqEmail) {
    MailApp.sendEmail({ to: cfg.hqEmail, subject: '⚠️ ' + stale.length + ' RecondHub lead(s) not followed up', body: text });
  }
  if (cfg.waWebhook && cfg.hqWhatsapp) {
    var headers = cfg.waToken ? { Authorization: 'Bearer ' + cfg.waToken } : {};
    UrlFetchApp.fetch(cfg.waWebhook, {
      method: 'post',
      contentType: 'application/json',
      headers: headers,
      payload: JSON.stringify({ to: cfg.hqWhatsapp, text: text }),
      muteHttpExceptions: true,
    });
  }
}

/** Lead timestamps are written by the website as "yyyy-MM-dd HH:mm:ss" in Malaysia time. */
function parseTimestamp_(v) {
  if (v instanceof Date) return v;
  var m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  return new Date(m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + (m[6] || '00') + '+08:00');
}

// ===== Setup.gs =====
/** Run once from the RecondHub menu (or the editor) to create the triggers. Safe to run again. */
function installTriggers() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var fn = t.getHandlerFunction();
    if (fn === 'escalateStaleLeads' || fn === 'onStockEdit' || fn === 'syncPhotos') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('escalateStaleLeads').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('onStockEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('syncPhotos').timeBased().everyMinutes(10).create();
  ss.toast('Triggers installed: escalation every 15 min, Stock auto-dates and photo folders, photo sync every 10 min.', 'RecondHub', 6);
}

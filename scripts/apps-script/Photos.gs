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

/** Folders inside the photos root, keyed by car code ("DC764 - Lexus LM 2025" → "DC764"). */
function rootFoldersByCode_() {
  var map = {};
  var it = photosRoot_().getFolders();
  while (it.hasNext()) {
    var f = it.next();
    var code = f.getName().split(' - ')[0].trim().toUpperCase();
    if (code && !map[code]) map[code] = f;
  }
  return map;
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
    var ours = rootFoldersByCode_();

    data.forEach(function (row, i) {
      var r = i + 2;
      if (!row[cols.code - 1]) return;
      var id = folderIdFromUrl_(row[cols[PHOTO_FOLDER_COL] - 1]);
      // A folder for this code inside "1. Gambar Stok Kereta" always wins over a link pasted from
      // somewhere else (e.g. staff's own Drive), so moving photos into the right folder is enough.
      var own = ours[String(row[cols.code - 1]).trim().toUpperCase()];
      if (own && own.getId() !== id) {
        id = own.getId();
        sheet.getRange(r, cols[PHOTO_FOLDER_COL]).setValue(own.getUrl());
        changed++;
      }
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

/**
 * Menu: put every car back on its own folder inside "1. Gambar Stok Kereta".
 * For each Stock row whose Folder Gambar points somewhere else (e.g. staff's own Drive), copy the
 * photos from that folder into the car's folder in the photos root (created if missing), point
 * Folder Gambar at it, then re-sync the photo links. Originals are left untouched.
 * Stops after ~5 minutes (Apps Script time limit); run it again to continue where it stopped.
 */
function fixAllPhotoFolders() {
  var started = Date.now();
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName('Stock');
  var cols = ensurePhotoColumn_(sheet);
  var ours = rootFoldersByCode_();
  var root = photosRoot_();
  var fixed = 0, copied = 0, unfinished = false;

  for (var r = 2; r <= sheet.getLastRow(); r++) {
    if (Date.now() - started > 5 * 60 * 1000) { unfinished = true; break; }
    var row = sheet.getRange(r, 1, 1, sheet.getLastColumn()).getValues()[0];
    var code = String(row[cols.code - 1] || '').trim().toUpperCase();
    if (!code) continue;
    var cell = sheet.getRange(r, cols[PHOTO_FOLDER_COL]);
    var linkedId = folderIdFromUrl_(cell.getValue());
    var own = ours[code];
    if (own && own.getId() === linkedId) continue; // already correct

    if (!own) {
      own = root.createFolder(folderName_(row, cols));
      own.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      ours[code] = own;
    }
    if (linkedId) {
      var have = {};
      var mine = own.getFiles();
      while (mine.hasNext()) have[mine.next().getName()] = true;
      try {
        var files = DriveApp.getFolderById(linkedId).getFiles();
        while (files.hasNext()) {
          if (Date.now() - started > 5 * 60 * 1000) { unfinished = true; break; }
          var f = files.next();
          var type = String(f.getMimeType());
          if (f.isTrashed() || (type.indexOf('image/') !== 0 && type !== 'application/pdf')) continue;
          if (have[f.getName()]) continue;
          f.makeCopy(f.getName(), own);
          have[f.getName()] = true;
          copied++;
        }
      } catch (err) {
        // old folder deleted or not shared with us: keep the new (empty) folder
      }
      if (unfinished) break; // leave the link as is so the next run finishes copying this car
    }
    cell.setValue(own.getUrl());
    if (cols.photos) sheet.getRange(r, cols.photos).clearContent(); // refilled by syncPhotos below
    fixed++;
  }

  syncPhotos();
  ss.toast(
    fixed + ' kereta dibetulkan, ' + copied + ' gambar disalin.' +
      (unfinished ? ' Belum habis: tekan menu ini sekali lagi.' : ' Siap. Tekan Refresh website.'),
    'RecondHub',
    10
  );
}

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

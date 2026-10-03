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

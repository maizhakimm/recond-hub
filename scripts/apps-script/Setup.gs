/** Run once from the RecondHub menu (or the editor) to create the triggers. Safe to run again. */
function installTriggers() {
  var ss = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var fn = t.getHandlerFunction();
    if (fn === 'escalateStaleLeads' || fn === 'onStockEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('escalateStaleLeads').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('onStockEdit').forSpreadsheet(ss).onEdit().create();
  ss.toast('Triggers installed: escalation every 15 min, Stock auto-dates.', 'RecondHub', 5);
}

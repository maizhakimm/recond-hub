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

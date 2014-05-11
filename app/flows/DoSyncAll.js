/**
 * Do sync all notes flow
 * 
 * @ahutor shinokiwa@gmail.com
 */
var syncStatus = require('./SyncStatus.js');

module.exports.Controller = syncStatus.Controller;

module.exports.Model = function(flow, request, response) {
	var sync = flow.use('Sync');
	sync.doSyncAll();
	flow.next();
};
module.exports.View = function(flow, request, response) {
	response.redirect(302, '/setting/sync/');
};
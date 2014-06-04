/**
 * Do sync all notes flow
 * 
 * @ahutor shinokiwa@gmail.com
 */
var syncStatus = require('./SyncStatus.js');

module.exports.Controller = syncStatus.Controller;

module.exports.Model = function(request, response, nextFlow, next) {
	var sync = this.use('Sync');
	sync.doSyncAll();
	next();
};
module.exports.View = function(request, response, nextFlow, next) {
	response.redirect(302, '/setting/sync/');
};
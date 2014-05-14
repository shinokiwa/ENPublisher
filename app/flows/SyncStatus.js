module.exports.Controller = function(flow, request, response) {
	if (request.session.logined) {
		flow.next();
	} else {
		response.redirect(302, '/setting/login/');
	}
};

module.exports.Model = function(flow, request, response) {
	var sync = flow.use('Sync');
	response.locals.message = sync.message;
	response.locals.notes = sync.noteList.all();
	response.locals.errors = sync.errorList.all();
	response.locals.USN = sync.USN;
	response.locals.lastSyncAll = sync.lastSyncAll;
	response.locals.lastSync = sync.lastSync;
	flow.next();
};

module.exports.View = function(flow, request, response) {
	response.render('setting/sync', response.locals);
	flow.next();
};

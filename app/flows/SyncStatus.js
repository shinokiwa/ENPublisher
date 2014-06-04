module.exports.Controller = function(request, response, nextFlow, next) {
	if (request.session.logined) {
		next();
	} else {
		response.redirect(302, '/setting/login/');
	}
};

module.exports.Model = function(request, response, nextFlow, next) {
	var sync = this.use('Sync');
	response.locals.message = sync.message;
	response.locals.notes = sync.noteList.all();
	response.locals.errors = sync.errorList.all();
	response.locals.USN = sync.USN;
	response.locals.duration = sync._duration;
	response.locals.lastSyncAll = sync.lastSyncAll;
	response.locals.lastSync = sync.lastSync;
	next();
};

module.exports.View = function(request, response, nextFlow, next) {
	response.render('setting/sync', response.locals);
	next();
};

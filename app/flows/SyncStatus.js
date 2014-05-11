module.exports.Controller = function(flow, request, response) {
	if (request.session.logined) {
		flow.next();
	} else {
		response.redirect(302, '/setting/login/');
	}
};

module.exports.Model = function(flow, request, response) {
	var sync = flow.use('Sync');
	response.locals.status = sync.status.string;
	response.locals.queue = sync.queuedNotes;
	response.locals.message = sync.message;
	response.locals.error = sync.error;
	flow.next();
};

module.exports.View = function(flow, request, response) {
	response.render('setting/sync', response.locals);
	flow.next();
};

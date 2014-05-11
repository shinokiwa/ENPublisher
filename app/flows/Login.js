/**
 * Login flow
 * author shinokiwa@gmail.com
 */
module.exports.Controller = function (flow, request, response) {
	if ('logined' in request.session && request.session.logined) {
		response.redirect (302, '/setting/sync/');
	} else {
		response.locals.id = '';
		response.locals.password = '';
		flow.next();
	}
};

module.exports.View = function (flow, request, response) {
	response.render('setting/login', response.locals);
	flow.next();
};


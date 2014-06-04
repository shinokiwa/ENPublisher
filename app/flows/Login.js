/**
 * Login flow
 * author shinokiwa@gmail.com
 */
module.exports.Controller = function (request, response, nextFlow, next) {
	if ('logined' in request.session && request.session.logined) {
		response.redirect (302, '/setting/sync/');
	} else {
		response.locals.id = '';
		response.locals.password = '';
		next();
	}
};

module.exports.View = function (request, response, nextFlow, next) {
	response.render('setting/login', response.locals);
	next();
};


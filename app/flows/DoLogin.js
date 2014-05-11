/**
 * DoLogin flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(flow, request, response) {
	if (request.session.logined) {
		response.redirect(302, '/setting/sync/');
	} else {
		response.locals.id = request.body.id || '';
		response.locals.password = request.body.password || '';
		flow.next();
	}
};

module.exports.Model = function(flow, request, response) {
	flow.use('Express');
	if (response.locals.id === response.locals.site.loginId && response.locals.password === response.locals.site.loginPassword) {
		request.session.logined = true;
		response.redirect(302, '/setting/sync/');
	} else {
		request.session.logined = false;
		response.locals.doLogin = true;
		flow.next();
	}
};

module.exports.View = require('./Login.js').View;
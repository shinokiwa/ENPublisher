/**
 * DoLogin flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(request, response, nextFlow, next) {
	if (request.session.logined) {
		response.redirect(302, '/setting/sync/');
	} else {
		response.locals.id = request.body.id || '';
		response.locals.password = request.body.password || '';
		next();
	}
};

module.exports.Model = function(request, response, nextFlow, next) {
	response.locals.site = this.use('Express').locals.site;
	if (response.locals.id === response.locals.site.loginId && response.locals.password === response.locals.site.loginPassword) {
		request.session.logined = true;
		response.redirect(302, '/setting/sync/');
	} else {
		request.session.logined = false;
		response.locals.doLogin = true;
		next();
	}
};

module.exports.View = require('./Login.js').View;
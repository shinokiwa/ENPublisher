/**
 * do logout flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(request, response, nextFlow, next) {
	request.session.logined = false;
	response.redirect(302, '/setting/login/');
	next();
};
/**
 * do logout flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(flow, request, response) {
	request.session.logined = false;
	response.redirect(302, '/setting/login/');
};
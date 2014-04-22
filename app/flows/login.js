/**
 * Login flow
 * author shinokiwa@gmail.com
 */
var common = require ('./common.js');

module.exports.c = function (req, input, next) {
	if ('login' in req.session) {
		input.login = (req.session.login == true);
	} else {
		input.login = false;
	}
	next();
};

module.exports.m = function (input, output, next) {
	output.login = input.login;
	next();
};

module.exports.v = function (res, output, next) {
	if (output.login) {
		res.redirect(301, '/setting/sync');
	} else {
		res.render('login', output);
	}
	next();
};
/**
 * Login flow
 * author shinokiwa@gmail.com
 */
var common = require ('./common.js');

module.exports.m = function (input, output, next) {
	common.model.requireAuth(input,output, function () {
		output.ID = '';
		output.Password = '';
		next();
	});
};

module.exports.v = function (res, output, next) {
	if (output.login) {
		res.redirect(302, '/setting/sync/');
	} else {
		res.render('setting/login', output);
	}
	next();
};
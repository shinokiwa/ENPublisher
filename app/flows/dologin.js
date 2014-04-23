/**
 * Login flow
 * author shinokiwa@gmail.com
 */
var common = require ('./common.js');
module.exports.c = function (request, input, next) {
	common.controller.requireAuth(request,input, function () {
		if (!request.session.login) {
			input.ID = request.body.ID;
			input.Password = request.body.Password;
		}
		next();
	});
};

module.exports.m = function (id, password) {
	return function (input, output, next) {
		var session = input.session();
		if (input.login) {
			output.login = true;
			output.dologin = false;
		} else {
			if (input.ID === id && input.Password === password) {
				output.login = true;
				session.login = true;
				output.dologin = true;
			} else {
				output.login = false;
				session.login = false;
				output.dologin = true;
				output.ID = input.ID;
				output.Password = input.Password;
			}
		}
		next();
	};
};

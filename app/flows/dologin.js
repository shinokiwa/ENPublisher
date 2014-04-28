/**
 * Login flow author shinokiwa@gmail.com
 */
var common = require('./common.js');
module.exports.controller = function(request, input, next) {
	common.controller.requireAuth(request, input, function() {
		if (!request.session.login) {
			input.ID = request.body.ID;
			input.Password = request.body.Password;
		}
		next();
	});
};

module.exports.model = function(input, output, next) {
	var login = input.components.login();
	var session = input.components.session();
	if (input.login) {
		output.login = true;
		output.dologin = false;
	} else {
		if (input.ID === login.ID && input.Password === login.Password) {
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

module.exports.view = require ('./login.js').view;
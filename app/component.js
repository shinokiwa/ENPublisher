module.exports = function (app, configure) {
	app.on('After.Controller', function(request, input, next) {
		if (!input.components) input.components = {};
		input.components.session = require ('./components/session.js')(request);
		input.components.login = require ('./components/login.js')(configure.get('Login.ID'), configure.get('Login.Password'));
		next&&next();
	});
};
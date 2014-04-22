module.exports = function (app, ex) {
	var common = require ('./flows/common.js');
	// TODO: move to other module
	app.on('After.Controller', function(request, input, next) {
		input.session = function () {
			return request.session;
		};
		next&&next();
	});
	
	var index = require ('./flows/index.js');
	ex.get('/', app.addFlow('Index', index.c, index.m, index.v));

	ex.get('/setting/', app.addFlow('Setting', null, null, common.view.redirect(302,'/setting/login/')));

	var login = require ('./flows/login.js');
	ex.get('/setting/login/', app.addFlow('Login', common.controller.requireAuth, common.model.requireAuth, login.v));

	ex.post('/setting/login/', app.flow('DoLogin'));
	ex.get('/setting/logout/', app.flow('DoLogout'));
	ex.get('/setting/sync', app.flow('SyncStatus'));
	
	app.addFlow('Error404', null, null, common.view.error(404,'error404'));
};

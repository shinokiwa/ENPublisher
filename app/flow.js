module.exports = function (app, express, configure) {
	var common = require ('./flows/common.js');
	var c = common.controller;
	var m = common.model;
	var v = common.view;
	// TODO: move to other module
	app.on('After.Controller', function(request, input, next) {
		input.session = function () {
			return request.session;
		};
		next&&next();
	});
	
	var index = require ('./flows/index.js');
	express.get('/', app.addFlow('Index', index.c, index.m, index.v));

	express.get('/setting/', app.addFlow('Setting', null, null, v.redirect(302,'/setting/login/')));

	var login = require ('./flows/login.js');
	express.get('/setting/login/', app.addFlow('Login', c.requireAuth, login.m, login.v));

	var dologin = require ('./flows/dologin.js');
	var dologinModel = dologin.m(configure.get('Login.ID'), configure.get('Login.Password'));
	express.post('/setting/login/', app.addFlow('DoLogin', dologin.c, dologinModel, login.v));
	
//	express.get('/setting/logout/', app.flow('DoLogout'));
	
	express.get('/setting/sync/', app.addFlow('SyncStatus', c.requireAuth, m.requireAuth, v.requireAuth('setting/sync')));
	
	app.addFlow('Error404', null, null, common.view.error(404,'error404'));
};

module.exports = function (app, express) {
	var common = require ('./flows/common.js');
	var c = common.controller;
	var m = common.model;
	var v = common.view;
	
	var index = require ('./flows/index.js');
	express.get('/', app.addFlow('Index', index));

	express.get('/setting/', app.addFlow('Setting', {view: v.redirect(302,'/setting/login/')}));

	var login = require ('./flows/login.js');
	express.get('/setting/login/', app.addFlow('Login', login));

	var dologin = require ('./flows/dologin.js');
	express.post('/setting/login/', app.addFlow('DoLogin', dologin));
	
//	express.get('/setting/logout/', app.flow('DoLogout'));
	
	express.get('/setting/sync/', app.addFlow('SyncStatus', {controller:c.requireAuth, model:m.requireAuth, view:v.requireAuth('setting/sync')}));
	
	app.addFlow('Error404', {view:common.view.error(404,'error404')});
};

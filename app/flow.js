module.exports = function (app, express) {
	var common = require ('./flows/common.js');
	var c = common.controller;
	var m = common.model;
	var v = common.view;
	
	var index = require ('./flows/index.js');
	express.get('/', app.addFlow('Index', index));

	express.get('/setting/', app.addFlow('Setting', {view: v.redirect(302,'/setting/login/')}));

	express.get('/setting/login/', app.addFlow('Login', require ('./flows/login.js')));

	express.post('/setting/login/', app.addFlow('DoLogin', require ('./flows/dologin.js')));
	
//	express.get('/setting/logout/', app.flow('DoLogout'));
	
	express.get('/setting/sync/', app.addFlow('SyncStatus', require ('./flows/syncstatus.js')));
	express.get('/setting/dosync/', app.addFlow('DoSync', require ('./flows/dosync.js')));
	
	app.addFlow('BatchSyncAll', require ('./flows/batchsyncall.js'));

	app.addFlow('Error404', {view:common.view.error(404,'error404')});
};

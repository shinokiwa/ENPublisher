/**
 * ENPublisher main module
 * 
 * @author shinokiwa@gmail.com
 */
module.exports.create = function (configurePath) {
	var App = require ('./app.js');
	var app = new App();
	app.add('LoadConfig', loadFlow('LoadConfig')(configurePath));
	app.add('StartProcess', loadFlow('StartProcess'));

	//set components
	app.set('Express', loadCom('express')(app, require ('express')));
	app.set('Database', loadCom('mongoose')(app));
	app.set('Sync', loadCom('sync')(app));
	app.set('Evernote', loadCom('evernote')(app, require('evernote')));

	//add flows
	app.add('Index', loadFlow('Index'));
	app.add('Post', loadFlow('Post'));
	app.add('Login', loadFlow('Login'));
	app.add('DoLogin', loadFlow('DoLogin'));
	app.add('DoLogout', loadFlow('DoLogout'));
	app.add('SyncStatus', loadFlow('SyncStatus'));
	app.add('DoSyncAll', loadFlow('DoSyncAll'));
	app.add('Error404', loadFlow('Error404'));
	
	app.add('BatchSyncAll', loadFlow('BatchSyncAll'));
	app.add('BatchSyncChunk', loadFlow('BatchSyncChunk'));
	app.add('BatchSyncNote', loadFlow('BatchSyncNote'));
	
	return app;
};

var loadCom = function (component) {
	var comPath = './components/'+component+'.js';
	return require (comPath);
};

var loadFlow = function (flow) {
	var flowPath = './flows/'+flow+'.js';
	return require (flowPath);
};
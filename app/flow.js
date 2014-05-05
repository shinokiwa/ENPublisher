module.exports = function (app, router) {
	var common = require ('./flows/common.js');
	var v = common.view;
	
	var index = require ('./flows/index.js');
	router.get('/', app.addFlow('Index', index));
	router.get('/post/:url', app.addFlow('Post', require ('./flows/post.js')));

	router.get('/setting/', app.addFlow('Setting', {view: v.redirect(302,'/setting/login/')}));

	router.get('/setting/login/', app.addFlow('Login', require ('./flows/login.js')));

	router.post('/setting/login/', app.addFlow('DoLogin', require ('./flows/dologin.js')));
	
//	router.get('/setting/logout/', app.flow('DoLogout'));
	
	router.get('/setting/sync/', app.addFlow('SyncStatus', require ('./flows/syncstatus.js')));
	router.get('/setting/dosync/', app.addFlow('DoSync', require ('./flows/dosync.js')));
	
	app.addFlow('BatchSyncAll', require ('./flows/batchsyncall.js'));
	app.addFlow('BatchSyncNote', require ('./flows/batchsyncnote.js'));
	app.addFlow('BatchSyncChunk', require ('./flows/batchsyncchunk.js'));

	app.addFlow('Error404', {view:common.view.error(404,'error404')});
};

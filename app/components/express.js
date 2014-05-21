var http = require('http');
var path = require('path');
var Express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');

module.exports = function(app) {
	var express = Express();
	var router = Express.Router();
	express.set('port', 80);
	express.set('views', path.join(__dirname, '../../templates/default'));
	express.set('view engine', 'jade');
	express.use(bodyParser());
	express.use(cookieParser());
	express.use(session({
		secret : 'enpublisher session',
		key : 'sid',
		cookie : {
			secure : false
		}
	}));
	express.use('/assets', Express.static(path.join(__dirname, '../../templates/default/assets/')));
	express.use('/resources', Express.static(path.join(__dirname, '../../resources/')));
	express.use(morgan());
	express.use(router);
	express.use(app.flow('Error404'));

	router.get('/', app.flow('Index'));
	router.get('/post/:url', app.flow('Post'));
	router.get('/id/:id', app.flow('FindId'));
	router.get('/setting/', app.flow('Login'));
	router.get('/setting/login/', app.flow('Login'));
	router.post('/setting/login/', app.flow('DoLogin'));
	router.get('/setting/logout/', app.flow('DoLogout'));
	router.get('/setting/sync/', app.flow('SyncStatus'));
	router.get('/setting/dosyncall/', app.flow('DoSyncAll'));
	
	app.on('Model.LoadConfig', function(flow) {
		express.locals.site = flow.locals.configure.site;
		flow.next();
	});

	app.on('Model.StartProcess', function(flow) {
		http.createServer(express).listen(express.get('port'), function() {
			console.log("Express server listening on port " + (express.get('port')));
		});
		flow.next();
	});

	return function (request, response) {
		response.locals.site = express.locals.site;
		return express;
	};
};
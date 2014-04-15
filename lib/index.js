/**
 * ENPublisher main module
 * 
 * @author shinokiwa@gmail.com
 */
var App = module.exports.App = require ('./app.js');
var express = require('express');
var http = require('http');
var path = require('path');
var Controller = require('./controller.js');
var Model = require('./model.js');
var View = require('./view.js');

module.exports.create = function () {
	var app = new App();
	var controller = new Controller();
	controller.bindTo(app);
	var model = new Model();
	model.bindTo(app);
	var view = new View();
	view.bindTo(app);

	var ex = express();
	ex.configure(function() {
		ex.set('port', 8000);
		ex.set('views', path.join(__dirname, '../templates/default'));
		ex.set('view engine', 'jade');
		ex.use(express.favicon());
		ex.use(express.logger());
		ex.use(express.bodyParser());
		ex.use(express.methodOverride());
		ex.use(express.cookieParser('your secret here'));
		ex.use(express.session());
		ex.use(ex.router);
		//ex.use(require('stylus').middleware(path.join(__dirname, '../templates/default/assets/css/')));
		ex.use(express["static"](path.join(__dirname, '../templates/default/assets/')));

		// TODO: move to other module.
		ex.get('/', app.flow('Index'));
		ex.get('/setting/', app.flow('Setting'));
		
		ex.use(app.flow('Error404'));
	});
	
	app.express = ex;
	return app;
};

module.exports.process = function(app) {
	http.createServer(app.express).listen( app.express.get('port'), function() {
		console.log("Express server listening on port " + (app.express.get('port')));
	});
};

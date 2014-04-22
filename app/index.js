/**
 * ENPublisher main module
 * 
 * @author shinokiwa@gmail.com
 */
var App = module.exports.App = require ('./app.js');
var express = require('express');
var http = require('http');
var path = require('path');
var flow = require ('./flow.js');

module.exports.create = function () {
	var app = new App();
	var ex = express();
	ex.configure(function() {
		ex.set('port', 8000);
		ex.set('views', path.join(__dirname, '../templates/default'));
		ex.set('view engine', 'jade');
		ex.use(express.logger());
		ex.use(express.bodyParser());
		ex.use(express.methodOverride());
		ex.use(express.cookieParser('your secret here'));
		ex.use(express.session());
		ex.use(ex.router);
		//ex.use(require('stylus').middleware(path.join(__dirname, '../templates/default/assets/css/')));
		ex.use(express["static"](path.join(__dirname, '../templates/default/assets/')));
		ex.use(app.flow('Error404'));
		
		flow(app, ex);
	});

	app.on('Process', function(next){
		http.createServer(ex).listen( ex.get('port'), function() {
			console.log("Express server listening on port " + (ex.get('port')));
		});
		next&&next();
	});

	return app;
};

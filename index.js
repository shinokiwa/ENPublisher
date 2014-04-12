var express = require('express');
var http = require('http');
var ENPublisher = require('./lib/index.js');
var path = require('path');
var app = express();
var enp = new ENPublisher ();

app.configure(function() {
	app.set('port', 8000);
	app.set('views', path.join(__dirname, './templates/default'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	// app.use(express.logger({"stream": log.access}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(path.join(__dirname, './templates/default/css/')));
	app.use(express["static"](path.join(__dirname, './views/default/files/')));
});

enp.express(app);

http.createServer(app).listen( app.get('port'), function() {
	console.log("Express server listening on port " + (app.get('port')));
});

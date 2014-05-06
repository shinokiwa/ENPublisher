var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');

module.exports = function(app) {
	var ex = express();
	var router = express.Router();
	ex.set('port', 80);
	ex.set('views', path.join(__dirname, '../templates/default'));
	ex.set('view engine', 'jade');
	ex.use(bodyParser());
	ex.use(cookieParser());
	ex.use(session({
		secret : 'enpublisher session',
		key : 'sid',
		cookie : {
			secure : false
		}
	}));
	ex.use('/assets', express.static(path.join(__dirname, '../templates/default/assets/')));
	ex.use('/resources', express.static(path.join(__dirname, '../resources/')));
	ex.use(morgan());
	ex.use(router);
	ex.use(app.flow('Error404'));

	app.on('Process', function(next) {
		http.createServer(ex).listen(ex.get('port'), function() {
			console.log("Express server listening on port " + (ex.get('port')));
		});
		next && next();
	});

	return router;
};
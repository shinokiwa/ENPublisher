/**
 * ENPublisher main module
 * 
 * @author shinokiwa@gmail.com
 */
var App = require ('./app.js');
var Configure = require ('./configure.js');
var Express = require ('./express.js');
var path = require('path');
var flow = require ('./flow.js');
var component = require ('./component.js');

module.exports.create = function () {
	var app = new App();
	var configure = new Configure (path.join(__dirname, '../configure.json'));
	var express = Express(app);
	flow(app, express);
	component(app, configure);
	return app;
};

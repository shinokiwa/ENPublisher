var express = require ('./views/renders/express.js');

module.exports = function (app) {
	app.on('View.Index', express.template('index'));
};
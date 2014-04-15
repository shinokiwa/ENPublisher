var common = require ('./views/common.js');
var v = module.exports = function () {
};

v.prototype.bindTo = function (app) {
	app.on('View.Index', common.template('index'));
	
	app.on('View.Setting', common.redirect(301, '/setting/login/'));

	app.on('View.Error404', common.error('404'));
};
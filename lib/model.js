var m = module.exports = function () {
};

m.prototype.bindTo = function (app) {
	app.on('Model.Index', require('./models/index.js'));
};
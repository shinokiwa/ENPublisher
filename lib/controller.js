var c = module.exports = function () {
};
c.prototype.bindTo = function (app) {
	app.on('Controller.Index', require('./controllers/index.js'));	
};
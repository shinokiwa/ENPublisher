var Index = function (request, params, next) {
	next();
};
module.exports = function (app) {
	app.on('Model.Index', Index);
};
var Index = function (request, params, next) {
	params.Page = 0;
	next();
};
module.exports = function (app) {
	app.on('Controller.Index', Index);
};
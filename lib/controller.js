var Index = function (request, params) {
	params.Page = 0;
	return;
};
module.exports = function (app) {
	app.on('Controller.Index', Index);
};
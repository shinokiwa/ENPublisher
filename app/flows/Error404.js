/**
 * 404 not found flow author shinokiwa@gmail.com
 */
module.exports.View = function(request, response, nextFlow, next) {
	response.status(404);
	response.render('error404', response.locals);
	next();
};
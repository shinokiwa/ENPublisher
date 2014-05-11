/**
 * 404 not found flow author shinokiwa@gmail.com
 */
module.exports.View = function(flow, request, response) {
	response.status(404);
	response.render('error404', response.locals);
	flow.next();
};
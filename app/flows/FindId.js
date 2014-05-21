/**
 * FindId flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(flow, request, response) {
	flow.use('Express');
	if ('id' in request.params && request.params.id) {
		flow.locals.id = encodeURIComponent(request.params.id);
	}
	flow.next();
};

module.exports.Model = function(flow, request, response) {
	if ('id' in flow.locals) {
		var db = flow.use('Database');
		var Post = db.model('Post');
		Post.published().and({
			guid : flow.locals.id
		}).select({
			url : 1
		}).findOne(function(err, data) {
			if (err) {
				console.error(err);
			} else if (data) {
				flow.locals.url = data.url;
			}
			flow.next();
		});
	} else {
		flow.next();
	}
};

module.exports.View = function(flow, request, response) {
	if ('url' in flow.locals) {
		response.redirect(302, '/post/'+flow.locals.url);
	} else {
		response.status(404);
		response.render('error404', response.locals);
	}
	flow.next();
};
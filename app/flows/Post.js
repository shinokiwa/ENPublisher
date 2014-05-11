/**
 * Post flow author shinokiwa@gmail.com
 */
var Index = require('./Index.js');
module.exports.Controller = function(flow, request, response) {
	flow.use('Express');
	if ('url' in request.params && request.params.url) {
		flow.locals.url = encodeURIComponent(request.params.url);
	}
	flow.next();
};

module.exports.Model = {
	getPost : function(flow, request, response) {
		if ('url' in flow.locals) {
			var db = flow.use('Database');
			var Post = db.model('Post');
			Post.published().where({url: flow.locals.url}).findOne(function(err, data) {
				if (err) {
					console.error(err);
				} else if (data) {
					response.locals.post = data;
				}
				flow.next();
			});
		} else {
			flow.next();
		}
	},
	recentPosts : Index.Model.recentPosts
};

module.exports.View = function(flow, request, response) {
	if ('post' in response.locals) {
		response.render('post', response.locals);
	} else {
		response.status(404);
		response.render('error404', response.locals);
	}
	flow.next();
};
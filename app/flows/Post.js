/**
 * Post flow author shinokiwa@gmail.com
 */
var Index = require('./Index.js');
module.exports.Controller = function(request, response, nextFlow, next) {
	this.use('Express');
	if ('url' in request.params && request.params.url) {
		this.url = encodeURIComponent(request.params.url);
	}
	next();
};

module.exports.Model = {
	getPost : function(request, response, nextFlow, next) {
		if ('url' in this) {
			var db = this.use('Database');
			var Post = db.model('Post');
			Post.published().and({url: this.url}).findOne(function(err, data) {
				if (err) {
					console.error(err);
				} else if (data) {
					response.locals.post = data;
				}
				next();
			});
		} else {
			next();
		}
	},
	recentPosts : Index.Model.recentPosts
};

module.exports.View = function(request, response, nextFlow, next) {
	if ('post' in response.locals) {
		response.render('post', response.locals);
	} else {
		response.status(404);
		response.render('error404', response.locals);
	}
	next();
};
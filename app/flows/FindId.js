/**
 * FindId flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(request, response, nextFlow, next) {
	this.use('Express');
	if ('id' in request.params && request.params.id) {
		this.id = encodeURIComponent(request.params.id);
	}
	next();
};

module.exports.Model = function(request, response, nextFlow, next) {
	if ('id' in this) {
		var db = this.use('Database');
		var Post = db.model('Post');
		var self = this;
		Post.published().and({
			guid : this.id
		}).select({
			url : 1
		}).findOne(function(err, data) {
			if (err) {
				console.error(err);
			} else if (data) {
				self.url = data.url;
			}
			next();
		});
	} else {
		next();
	}
};

module.exports.View = function(request, response, nextFlow, next) {
	if ('url' in this) {
		response.redirect(302, '/post/'+this.url);
	} else {
		response.status(404);
		response.render('error404', response.locals);
	}
	next();
};
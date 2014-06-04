/**
 * Index flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(request, response, nextFlow, next) {
	var page;
	if (request.query.page) {
		page = parseInt(request.query.page);
	} else {
		page = 0;
	}
	response.locals.page = page;
	response.locals.startIndex = page * 20;
	this.use('Express');
	next();
};

module.exports.Model = {
	countPosts : function(request, response, nextFlow, next) {
		var db = this.use('Database');
		var Post = db.model('Post');
		Post.published().count(function(err, count) {
			if (err) {
				console.error(err);
			} else {
				response.locals.totalPosts = count;
			}
			next();
		});
	},
	getPosts : function(request, response, nextFlow, next) {
		var db = this.use('Database');
		var Post = db.model('Post');
		Post.published().setOptions({
			limit : 20,
			skip : response.locals.startIndex,
			sort : {
				created : -1
			}
		}).exec(function(err, data) {
			if (err) {
				console.error(err);
			} else {
				response.locals.posts = data;
			}
			next();
		});
	},
	recentPosts : function(request, response, nextFlow, next) {
		var db = this.use('Database');
		var Post = db.model('Post');
		Post.published().select({
			title : 1,
			url : 1
		}).setOptions({
			limit : 20,
			sort : {
				created : -1
			}
		}).exec(function(err, data) {
			if (err) {
				console.error(err);
			} else {
				response.locals.recentPosts = data;
			}
			next();
		});
	}
};

module.exports.View = function(request, response, nextFlow, next) {
	response.render('index', response.locals);
	next();
};
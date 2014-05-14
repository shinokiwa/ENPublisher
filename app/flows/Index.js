/**
 * Index flow author shinokiwa@gmail.com
 */
module.exports.Controller = function(flow, request, response) {
	var page;
	if (request.query.page) {
		page = parseInt(request.query.page);
	} else {
		page = 0;
	}
	response.locals.page = page;
	response.locals.startIndex = page * 20;
	flow.use('Express');
	flow.next();
};

module.exports.Model = {
	countPosts : function(flow, request, response) {
		var db = flow.use('Database');
		var Post = db.model('Post');
		Post.published().count(function(err, count) {
			if (err) {
				console.error(err);
				flow.next();
			} else {
				response.locals.totalPosts = count;
				flow.next();
			}
		});
	},
	getPosts : function(flow, request, response) {
		var db = flow.use('Database');
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
				flow.next();
			} else {
				response.locals.posts = data;
				flow.next();
			}
		});
	},
	recentPosts : function(flow, request, response) {
		var db = flow.use('Database');
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
				flow.next();
			} else {
				response.locals.recentPosts = data;
				flow.next();
			}
		});
	}
};

module.exports.View = function(flow, request, response) {
	response.render('index', response.locals);
	flow.next();
};
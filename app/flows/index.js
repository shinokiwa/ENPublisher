/**
 * Index flow author shinokiwa@gmail.com
 */
var common = require('./common.js');

module.exports.controller = function(request, input, next) {
	input.page = 0;
	next();
};

module.exports.model = function(input, output, next) {
	var db = input.components.database();
	var Post = db.model('Post');
	var conditions = {
		view : true
	};
	var posts = {
		startIndex : 0
	};
	Post.count(conditions, function(err, count) {
		if (err) {

		} else {
			posts.totalPosts = count;
			Post.find(conditions, null, {
				limit : 20,
				skip : 0
			}, function(err, data) {
				posts.posts = data;
				output.posts = posts;
				next();
			});
		}
	});
};

module.exports.view = common.view.template('index');
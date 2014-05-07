/**
 * Index flow author shinokiwa@gmail.com
 */
var common = require('./common.js');

module.exports.controller = function(request, input, next) {
	if (request.query.page) {
		input.page = request.query.page;
	} else {
		input.page = 0;
	}
	next();
};

module.exports.model = function(input, output, next) {
	var db = input.components.database();
	var Post = db.model('Post');
	var postCom = input.components.post();
	var conditions = {
		tags : {
			$elemMatch : {
				guid : postCom._published
			}
		}
	};
	var posts = {
		page: input.page,
		startIndex : input.page*20
	};
	Post.count(conditions, function(err, count) {
		if (err) {

		} else {
			posts.totalPosts = count;
			Post.find(conditions, null, {
				limit : 20,
				skip : input.page*20,
				sort : {
					created : -1
				}
			}, function(err, data) {
				posts.posts = data;
				output.posts = posts;
				next();
			});
		}
	});
};

module.exports.view = common.view.template('index');
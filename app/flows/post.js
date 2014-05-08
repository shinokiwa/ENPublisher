/**
 * Post flow author shinokiwa@gmail.com
 */
var common = require('./common.js');

module.exports.controller = function(request, input, next) {
	if ('url' in request.params) {
		input.valid = true;
		input.url = encodeURIComponent(request.params.url);
	} else {
		input.valid = false;
	}
	next();
};

module.exports.model = function(input, output, next) {
	if (input.valid) {
		var db = input.components.database();
		var Post = db.model('Post');
		var postCom = input.components.post();
		var conditions = {
			url : input.url,
			tags : {
				$elemMatch : {
					guid : postCom._published
				}
			}
		};
		Post.findOne(conditions, null, null, function(err, data) {
			if (data) {
				output.post = data;
			}
			var conditions = {
					tags : {
						$elemMatch : {
							guid : postCom._published
						}
					}
				};
			Post.find(conditions, {title: 1, url: 1}, {
				limit : 20,
				sort : {
					created : -1
				}
			}, function(err, data) {
				output.recentPosts = data;
				next();
			});
		});
	} else {
		next();
	}

};

module.exports.view = function (response,output,next) {
	if ('post' in output) {
		common.view.template('post')(response, output, next);
	} else {
		common.view.error(404)(response, output, next);
	}
};
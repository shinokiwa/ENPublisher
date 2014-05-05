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
		var conditions = {
			url : input.url,
			view : true
		};
		Post.findOne(conditions, null, null, function(err, data) {
			if (data) {
				output.post = data;
			}
			next();
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
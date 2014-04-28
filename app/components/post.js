var PostModel;

var Post = function (mongoose, publishedGUID) {
	this._db = mongoose;
	this._published = publishedGUID;
};

Post.prototype.save = function (data, next) {
	var post = new PostModel (data);
	post.save(next);
};


module.exports = function(mongoose, publishedGUID) {
	var post = new Post(mongoose, publishedGUID);
	PostModel = mongoose().model('Post');
	return function() {
		return post;
	};
};
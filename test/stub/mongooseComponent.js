var mongoose = {};
mongoose.model = function (name) {
	if (name in models) {
		return models[name];
	} else {
		return;
	}
};

module.exports = function () {
	return mongoose;
};

var Post = function (data) {
	this._data = data;
};

Post.prototype.save = function (next) {
	next (null, this._data);
};

var models = {
	Post: Post
};

var PostModel;

var Post = function(mongoose, publishedGUID) {
	this._db = mongoose;
	this._published = publishedGUID;
	this.find = PostModel.find;
};

Post.prototype.remove = function (guid, next) {
	PostModel.findOneAndRemove({guid: guid}, next);
};

Post.prototype.save = function(note, next) {
	var post = new PostModel(note);

	var split = note.title.split('#');
	if (split.length == 1 || split[1].length < 1) {
		post.title = split[0].replace(/(^\s+)|(\s+$)/g, "");
		post.url = encodeURIComponent(split[0].replace(/(^\s+)|(\s+$)/g, ""));
	} else {
		post.title = split[0].replace(/(^\s+)|(\s+$)/g, "");
		post.url = split[1].replace(/(^\s+)|(\s+$)/g, "");
	}
	
	if (note.tagGuids && note.tagGuids.indexOf(this._published) == -1) {
		post.view = false;
		post.published = null;
	} else {
		post.view = true;
		post.published = new Date();
	}

	PostModel.findOne({
		url : post.url
	}, function(err, data) {
		if (err) {
			next (err, null);
		} else if (data && (data.guid != post.guid)) {
			next({
				message : 'Duplicate URL.'
			});
		} else {
			PostModel.findOneAndUpdate({
				guid : post.guid
			}, post.toObject(), {
				upsert : true
			}, next);
		}
	});
};

Post.prototype.getMetaAll = function (next) {
	PostModel.find({}, {guid:true, title:true}, next);
};

module.exports = function(mongoose, publishedGUID) {
	PostModel = mongoose().model('Post');
	return function() {
		var post = new Post(mongoose, publishedGUID);
		return post;
	};
};
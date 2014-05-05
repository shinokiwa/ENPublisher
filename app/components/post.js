var PostModel;
var path = require('path');
var fs = require('fs');
var crypto = require ('crypto');

var Post = function(mongoose, publishedGUID) {
	this._db = mongoose;
	this._published = publishedGUID;
};

Post.prototype.find = function(conditions, fields, options, next) {
	PostModel.find(conditions, fields, options, next);
};

Post.prototype.remove = function(conditions, next) {
	PostModel.remove(conditions, next);
};

Post.prototype.save = function(note, next) {
	var post = new PostModel(note);

	var split = note.title.split('#');
	if (split.length == 1 || split[1].length < 1) {
		post.title = split[0].trim();
		post.url = encodeURIComponent(split[0].trim());
	} else {
		post.title = split[0].trim();
		post.url = split[1].trim();
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
			next(err, null);
		} else if (data && (data.guid != post.guid)) {
			next({
				message : 'Duplicate URL.'
			});
		} else {
			PostModel.findOneAndUpdate({
				guid : post.guid
			}, post.toObject(), {
				upsert : true
			}, function(err) {
				if (err) {
					next(err, null);
				} else {
					if (note.resources) {
						var folder = path.join(__dirname, '../../resources/', note.guid);
						fs.stat(folder, function(err, stat) {
							if (!stat) {
								fs.mkdirSync(folder, 0777);
							}
							note.resources.forEach(function(r) {
								var img = new Buffer(r.data.body);
								var ext = r.mime.split('/')[1];
								var md5 = crypto.createHash('md5');
								md5.update(img);
								var hash = md5.digest('hex');
								fs.writeFile(path.join(folder, hash + '.' + ext), img, {
									mode : 0777
								});
							});
							next(null);
						});
					} else {
						next(null);
					}
				}
			});
		}
	});
};

Post.prototype.getMetaAll = function(next) {
	PostModel.find({}, {
		guid : true,
		title : true
	}, next);
};

module.exports = function(mongoose, publishedGUID) {
	PostModel = mongoose().model('Post');
	return function() {
		var post = new Post(mongoose, publishedGUID);
		return post;
	};
};
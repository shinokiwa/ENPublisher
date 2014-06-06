module.exports.Controller = function(next) {
	var sync = this.use('Sync');
	this.lock = sync.lock('Processing BatchSyncNote.');
	if (this.lock) {
		next();
	} else {
		sync.errorList.add('BatchSyncNote', 'Failed to get lock.');
	}
};

module.exports.Model = function(next) {
	var evernote = this.use('Evernote');
	var sync = this.use('Sync');

	var target = sync.noteList.get();

	if (target) {
		var self = this;
		evernote.getNote(target.key, function(err, note) {
			sync.noteList.remove(target.key);
			if (err) {
				sync.errorList.add(target.key, err);
				next();
			} else {
				if (note) {
					saveNote(self, note, next);
				} else {
					removeNote(self, target, next);
				}
			}
		});
	} else {
		next();
	}
};

var saveNote = function (flow, note, next) {
	var Post = flow.use('Database').model('Post');
	var post = new Post(note);
	var sync = flow.use('Sync');
	Post.find({
		$or : [ {
			url : post.url
		}, {
			guid : post.guid
		} ]
	}, function(err, data) {
		if (err) {
			sync.errorList.add(note.guid, err);
			next();
		} else if (data.length > 1 || (data.length == 1 && data[0].guid !== note.guid)) {
			sync.errorList.add(note.guid, 'duplicate URL in "'+note.title+'".');
			next();
		} else if (data.length == 1) {
			data[0].set(note).save(function(err) {
				if (err) {
					sync.errorList.add(note.guid, err);
					next();
				} else {
					sync.errorList.remove(note.guid);
					saveResource(flow, note, next);
				}
			});
		} else {
			post.save(function(err) {
				if (err) {
					sync.errorList.add(post.guid, err);
					next();
				} else {
					sync.errorList.remove(post.guid);
					saveResource(flow, note, next);
				}
			});
		}
	});
};

var saveResource = function(flow, note, next) {
	if (note.resources && note.resources.length > 0) {
		var path = require('path');
		var fs = require('fs');
		var crypto = require('crypto');
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
			next();
		});
	} else {
		next();
	}
};

var removeNote = function (flow, target, next) {
	var Post = flow.use('Database').model('Post');
	var sync = flow.use('Sync');
	Post.remove({
		guid : target.key
	}, function(err) {
		if (err) {
			sync.errorList.add(target.key, err);
		} else {
			sync.errorList.remove(target.key);
		}
		next();
	});
};

module.exports.View = function(next) {
	var sync = this.use('Sync');
	sync.unlock(this.lock);
	next();
};

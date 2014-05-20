module.exports.Controller = function(flow) {
	var sync = flow.use('Sync');
	flow.locals.lock = sync.lock('Processing BatchSyncNote.');
	if (flow.locals.lock) {
		flow.next();
	} else {
		sync.errorList.add('BatchSyncNote', 'Failed to get lock.');
	}
};

module.exports.Model = function(flow) {
	var evernote = flow.use('Evernote');
	var sync = flow.use('Sync');

	var target = sync.noteList.get();

	if (target) {
		evernote.getNote(target.key, function(err, note) {
			sync.noteList.remove(target.key);
			if (err) {
				sync.errorList.add(target.key, err);
				flow.next();
			} else {
				if (note) {
					saveNote(flow, note);
				} else {
					removeNote(flow, target);
				}
			}
		});
	} else {
		flow.next();
	}
};

var saveNote = function (flow, note) {
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
			flow.next();
		} else if (data.length > 1 || (data.length == 1 && data[0].guid !== note.guid)) {
			sync.errorList.add(note.guid, 'duplicate URL in "'+note.title+'".');
			flow.next();
		} else if (data.length == 1) {
			data[0].set(note).save(function(err) {
				if (err) {
					sync.errorList.add(note.guid, err);
					flow.next();
				} else {
					sync.errorList.remove(note.guid);
					saveResource(flow, note);
				}
			});
		} else {
			post.save(function(err) {
				if (err) {
					sync.errorList.add(post.guid, err);
					flow.next();
				} else {
					sync.errorList.remove(post.guid);
					saveResource(flow, note);
				}
			});
		}
	});
};

var saveResource = function(flow, note) {
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
			flow.next();
		});
	} else {
		flow.next();
	}
};

var removeNote = function (flow, target) {
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
		flow.next();
	});
};

module.exports.View = function(flow) {
	var sync = flow.use('Sync');
	sync.unlock(flow.locals.lock);
	flow.next();
};

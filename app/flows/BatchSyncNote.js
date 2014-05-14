module.exports.Controller = function(flow) {
	var sync = flow.use('Sync');
	if (sync.lock('Processing BatchSyncNote.')) {
		flow.next();
	} else {
		sync.errorList.add(flow.name, 'Failed to get lock.');
	}
};

module.exports.Model = function(flow) {
	var evernote = flow.use('Evernote');
	var Post = flow.use('Database').model('Post');
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
					flow.locals.note = note;
					var post = new Post(note);
					Post.find({
						$or : [ {
							url : post.url
						}, {
							guid : post.guid
						} ]
					}, function(err, data) {
						if (err) {
							sync.errorList.add(target.key, err);
							flow.next();
						} else if (data.length > 1 || (data.length == 1 && data[0].guid !== target.key)) {
							sync.errorList.add(target.key, 'duplicate URL.');
							flow.next();
						} else if (data.length == 1) {
							data[0].set(note).save(function(err) {
								if (err) {
									sync.errorList.add(target.key, err);
								} else {
									sync.errorList.remove(target.key);
								}
								flow.after(afterSave);
								flow.next();
							});
						} else {
							post.save(function(err) {
								if (err) {
									sync.errorList.add(target.key, err);
								} else {
									sync.errorList.remove(target.key);
								}
								flow.after(afterSave);
								flow.next();
							});
						}
					});
				} else {
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
				}
			}
		});
	} else {
		flow.next();
	}
};

var afterSave = function(flow) {
	var note = flow.locals.note;
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

module.exports.View = function(flow) {
	var sync = flow.use('Sync');
	sync.unlock();
	flow.next();
};

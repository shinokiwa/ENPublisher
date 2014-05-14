module.exports.Controller = function (flow) {
	var sync = flow.use('Sync');
	if (sync.lock('Processing BatchSyncAll.')) {
		flow.locals.offset = 0;
		flow.next();
	} else {
		sync.errorList.add('BatchSyncAll', 'Failed to get lock.');
	}
};

module.exports.Model = {};
var syncEvernote = module.exports.Model.Evernote = function (flow) {
	var sync = flow.use('Sync');
	var evernote = flow.use('Evernote');
	evernote.getMetaAll(flow.locals.offset, function (err, list) {
		if (err) {
			sync.errorList.add('BatchSyncAll', JSON.stringify(err));
		}
		if (list) {
			list.notes.forEach (function (note) {
				sync.noteList.add(note.guid, note.title);
			});
			var noteCount = list.startIndex + list.notes.length;
			if (noteCount < list.totalNotes) {
				flow.locals.offset = noteCount;
				process.nextTick(function () {
					syncEvernote(flow);
				});
			} else {
				sync.USN = list.updateCount;
				var date = new Date();
				sync.lastSync = date;
				sync.lastSyncAll = date;
				flow.next();
			}
		} else {
			flow.next();
		}
	});
};

module.exports.Model.Database = function (flow) {
	var sync = flow.use('Sync');
	var Post = flow.use('Database').model('Post');
	Post.find({}, {guid: 1, title:1}, function (err, list) {
		if (list) {
			list.forEach(function (post) {
				sync.noteList.add(post.guid, post.title);
			});
		}
		flow.next();
	});
};

module.exports.View = function (flow) {
	var sync = flow.use('Sync');
	sync.unlock();
	flow.next();
};

module.exports.steps = ['Lock', 'Note', 'Database', 'Tag', 'Unlock'];

module.exports.Lock = function(next) {
	var sync = this.use('Sync');
	this.lock = sync.lock('Processing BatchSyncAll.');
	if (this.lock) {
		this.offset = 0;
		next();
	} else {
		sync.errorList.add('BatchSyncAll', 'Failed to get lock.');
	}
};

var syncEvernote = module.exports.Note = function(next) {
	var sync = this.use('Sync');
	var evernote = this.use('Evernote');
	var self = this;
	evernote.getMetaAll(this.offset, function(err, list) {
		if (err) {
			sync.errorList.add('BatchSyncAll', JSON.stringify(err));
		}
		if (list) {
			list.notes.forEach(function(note) {
				sync.noteList.add(note.guid, note.title);
			});
			var noteCount = list.startIndex + list.notes.length;
			if (noteCount < list.totalNotes) {
				self.offset = noteCount;
				process.nextTick(function() {
					syncEvernote.apply(self, [next]);
				});
			} else {
				sync.USN = list.updateCount;
				var date = new Date();
				sync.lastSync = date;
				sync.lastSyncAll = date;
				next();
			}
		} else {
			next();
		}
	});
};

module.exports.Database = function(next) {
	var sync = this.use('Sync');
	var Post = this.use('Database').model('Post');
	Post.find({}, {
		guid : 1,
		title : 1
	}, function(err, list) {
		if (list) {
			list.forEach(function(post) {
				sync.noteList.add(post.guid, post.title);
			});
		}
		next();
	});
};

module.exports.Tag = function(next) {
	var sync = this.use('Sync');
	var evernote = this.use('Evernote');
	evernote.listTagsByNotebook(function(err, list) {
		if (list) {
			list.forEach(function(tag) {
				sync.tagList.add(tag.guid, tag.name);
			});
		}
		next();
	});
};
module.exports.Unlock = function(next) {
	var sync = this.use('Sync');
	sync.unlock(this.lock);
	sync.duration(15 * 60);
	next();
};

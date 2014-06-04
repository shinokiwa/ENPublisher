module.exports.Controller = function(next) {
	var sync = this.use('Sync');
	this.lock = sync.lock('Processing BatchSyncChunk.');
	if (this.lock) {
		next();
	} else {
		sync.errorList.add('BatchSyncChunk', 'Failed to get lock.');
	}
};

module.exports.Model = function(next) {
	var sync = this.use('Sync');
	var evernote = this.use('Evernote');
	evernote.getSyncState(function(err, state) {
		if (err) {
			sync.errorList.add('BatchSyncChunk', JSON.stringify(err));
			next();
		} else {
			if (!sync.USN || sync.USN >= state.updateCount) {
				sync.USN = state.updateCount;
				next();
			} else {
				evernote.getSyncChunk(sync.USN, function(err, chunk) {
					if (err) {
						sync.errorList.add('BatchSyncChunk', JSON.stringify(err));
					} else {
						if ('notes' in chunk && chunk.notes) {
							chunk.notes.forEach(function(note) {
								sync.noteList.add(note.guid, note.title);
							});
						}
						sync.USN = chunk.chunkHighUSN;
						sync.lastSync = new Date();
					}
					next();
				});

			}
		}
	});
};

module.exports.View = function(next) {
	var sync = this.use('Sync');
	sync.unlock(this.lock);
	sync.duration(60);
	next();
};

module.exports.Controller = function(flow) {
	var sync = flow.use('Sync');
	flow.locals.lock = sync.lock('Processing BatchSyncChunk.');
	if (flow.locals.lock) {
		flow.next();
	} else {
		sync.errorList.add('BatchSyncChunk', 'Failed to get lock.');
	}
};

module.exports.Model = function(flow) {
	var sync = flow.use('Sync');
	var evernote = flow.use('Evernote');
	evernote.getSyncState(function(err, state) {
		if (err) {
			sync.errorList.add(flow.name, JSON.stringify(err));
			flow.next();
		} else {
			if (!sync.USN || sync.USN > state.updateCount) {
				sync.USN = state.updateCount;
				flow.next();
			} else if (state.updateCount > sync.USN) {
				evernote.getSyncChunk(sync.USN, function(err, chunk) {
					if (err) {
						sync.errorList.add(flow.name, JSON.stringify(err));
					} else {
						if ('notes' in chunk && chunk.notes) {
							chunk.notes.forEach(function(note) {
								sync.noteList.add(note.guid, note.title);
							});
						}
						sync.USN = chunk.chunkHighUSN;
						sync.lastSync = new Date();
					}
					flow.next();
				});

			} else {
				flow.next();
			}
		}
	});
};

module.exports.View = function(flow) {
	var sync = flow.use('Sync');
	sync.unlock(flow.locals.lock);
	sync.duration(60);
	flow.next();
};

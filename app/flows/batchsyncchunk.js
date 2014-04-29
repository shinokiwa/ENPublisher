module.exports.model = function(input, output, next) {
	var sync = input.components.sync();
	if (sync.status.now) {
		next();
	} else if (sync.USN == null) {
		sync.doSyncChunk();
		next();
	} else {
		var evernote = input.components.evernote();
		sync.updateStatus('CHUNK');
		evernote.getSyncState(function(err, state) {
			if (state.updateCount > sync.USN) {
				evernote.getSyncChunk(sync.USN, function(err, chunk) {
					sync.queue(chunk.notes);
					sync.updateStatus(null);
					sync.USN = chunk.updateCount;
					sync.updateLastSyncTime();
					sync.doSyncNote();
					next();
				});
			} else {
				sync.updateStatus(null);
				sync.doSyncChunk();
				next();
			}
		});
	}
};
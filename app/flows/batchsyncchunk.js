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
			if (err || state.updateCount > sync.USN) {
				console.log ('BatchSyncChunk');
				evernote.getSyncChunk(sync.USN, function(err, chunk) {
					if (err || !chunk) {
						sync.queue(chunk.notes);
						sync.updateStatus(null);
						sync.USN = chunk.updateCount;
						sync.updateLastSyncTime();
						sync.doSyncNote();
						next();
					} else {
						if (err) console.log (err);
						sync.updateStatus(null);
						sync.doSyncChunk();
						next();
					}
				});
			} else {
				if (err) console.log (err);
				sync.updateStatus(null);
				sync.doSyncChunk();
				next();
			}
		});
	}
};
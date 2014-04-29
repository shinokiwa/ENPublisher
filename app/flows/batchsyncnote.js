module.exports.model = function(input, output, next) {
	var sync = input.components.sync();
	if (sync.status.now) {
		sync.message.push('SyncNote: Another process is running.');
		next();
	} else {
		var evernote = input.components.evernote();
		var post = input.components.post();
		var queue = null;
		var process = function() {
			sync.updateStatus('NOTE');
			queue = sync.queuedNotes.shift();
			if (queue) {
				evernote.getNote(queue.guid, function(err, note) {
					if (err) {
						processed(err);
					} else {
						if (note) {
							post.save(note, processed);
						} else {
							post.remove({
								guid : queue.guid
							}, function (err) {
								processed(err);
							});
						}
					}
				});
			} else {
				processed(null);
			}
		};
		var processed = function(err, note) {
			if (err) {
				sync.error.push('SyncNote: {guid: ' + queue.guid + ' , title: ' + queue.title + ' } ' + err.message);
			}
			if (sync.queuedNotes.length) {
				setTimeout(function() {
					process();
				}, 1000);
			} else {
				sync.updateStatus(null);
				sync.doSyncChunk();
				next();
			}
		};
		process();
	}
};
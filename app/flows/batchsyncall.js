module.exports.model = function (input, output, next) {
	var sync = input.components.sync();
	var now = new Date();
	if (now - sync.lastSyncAllTime < 15 * 60 * 1000) {
		sync.message.push('SyncAll: Please run Sync All at intervals for more than 15 minutes all year.');
		next();
	} else if (sync.status.now) {
		sync.message.push('SyncAll: Another process is running.');
		next();
	} else {
		sync.clearQueue();
		var evernote = input.components.evernote();
		var post = input.components.post();
		var noteSync = function () {
			sync.updateStatus('ALL');
			var offset = sync.queuedNotes.length;
			
			evernote.getMetaAll(offset, function (err, list) {
				sync.queue(list.notes);
				if (list.startIndex + list.notes.length < list.totalNotes) {
					setTimeout(function (){
						noteSync();
						}, 0);
				} else {
					sync.USN = list.updateCount;
					sync.updateLastSyncAllTime();
					postSync();
				}
			});
		};
		var postSync = function () {
			post.getMetaAll(function (err, data) {
				for (var i in data) {
					var duplicate = false;
					for (var n in sync.queuedNotes) {
						if (sync.queuedNotes[n].guid == data[i].guid) duplicate = true;
					}
					if (!duplicate) sync.queue([data[i]]);
				}
				sync.updateStatus(null);
				sync.doSyncNote();
				next();
			});
		};
		noteSync();
	}
};

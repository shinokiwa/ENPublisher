var Sync = function(app) {
	this.error = new Array();
	this.message = new Array();
	this.lastSyncTime = null;
	this.lastSyncAllTime = null;
	this.USN = null;
	this.status = {
			now : false,
			string : null,
			timer: null
		};
	this.queuedNotes = new Array();

	this.doSyncAll = function() {
		setTimeout(app.flow('BatchSyncAll'), 1000);
	};
	this.doSyncNote = function() {
		setTimeout(app.flow('BatchSyncNote'), 1000);
	};
	this.doSyncChunk = function() {
		setTimeout(app.flow('BatchSyncChunk'), 60*1000);
	};
};

Sync.prototype.updateLastSyncAllTime = function() {
	var now = new Date();
	this.lastSyncAllTime = now;
	this.lastSyncTime = now;
};

Sync.prototype.updateLastSyncTime = function() {
	var now = new Date();
	this.lastSyncTime = now;
};

Sync.prototype.updateStatus = function (status) {
	if (this.status.timer) {
		clearTimeout(this.status.timer);
		this.status.timer = null;
	}
	if (status == null) {
		this.status.now = false;
		this.status.string='WAIT';
	} else {
		this.status.now = true;
		this.status.string = status;
	}
	this.status.timer = setTimeout(function () {
		this.status.now = false;
		this.status.string = null;
	}, 15 * 60 * 1000);
};

Sync.prototype.queue = function(noteList) {
	for (i in noteList) {
		var note = {
			guid : noteList[i].guid,
			title : noteList[i].title
		};
		this.queuedNotes.push(note);
	}
};
Sync.prototype.clearQueue = function() {
	this.queuedNotes = new Array();
};
Sync.prototype.isQueued = function() {
	return this.queuedNotes.length > 0;
};

var sync = null;

module.exports = function(app) {
	if (!sync) sync = new Sync(app);
	return function() {
		return sync;
	};
};
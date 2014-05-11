var stub = function() {
	this.USN = null;
	this.message = new Array();
	this.error = new Array();
	this.queuedNotes = new Array();
	this.lastSyncTime = null;
	this.lastSyncAllTime = null;
	this.status = {
		now : false,
		string : null
	};
};

module.exports = function () {
	var sync = new stub();
	return function () {
		return sync;
	};
};

stub.prototype.updateLastSyncAllTime = function() {
	var now = new Date();
	this.lastSyncTime = now;
	this.lastSyncAllTime = now;
};

stub.prototype.updateLastSyncTime = function() {
	var now = new Date();
	this.lastSyncTime = now;
};

stub.prototype.queue = function(list) {
	for ( var i in list) {
		this.queuedNotes.push(list[i]);
	}
};

stub.prototype.updateStatus = function(status) {
	if (status) {
		this.status.string = status;
		this.status.now = true;
	} else {
		this.status.string = null;
		this.status.now = false;
	}
};

stub.prototype.clearQueue = function() {
	while(this.queuedNotes.shift()) {};
};

stub.prototype.doSyncNote = function() {
};

stub.prototype.doSyncChunk = function() {
};

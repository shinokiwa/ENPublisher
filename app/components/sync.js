var EventEmitter = require ('events').EventEmitter;
var util = require("util");
var app, sync;

module.exports = function (App) {
	app = App;
	app.on('Model.LoadConfig', loadConfig);
	sync = new Sync();
	app.on('View.LoadConfig', function (flow) {
		flow.async('BatchSyncChunk')();
		flow.next();
	});
	return function () {
		return sync;
	};
};

var loadConfig = function (flow) {
	sync = new Sync();
	flow.next();
};

var Sync = function () {
	EventEmitter.call(this);
	this.USN = null;
	this.message = null;
	this.lastSync = null;
	this.lastSyncAll = null;
	this.standby = null;
	this.noteList = new List ();
	this.tagList = new List ();
	this.errorList = new List ();
	this.resetInterval();
	
	this._lock = false;
	this._timer = null;
	this.on('unlock', this.doSync);
};

util.inherits(Sync, EventEmitter);

Sync.prototype.resetInterval = function () {
	this.intervalSyncAll = 15 * 60 * 1000;
	this.intervalSyncChunk = 60 * 1000;
	this.intervalSyncNote = 1000;
	this.intervalSyncTag = 1000;
};

Sync.prototype.lock = function (message) {
	if (this._lock) {
		return false;
	} else {
		this._lock = true;
		this.message = message;
		return true;
	}
};

Sync.prototype.unlock = function () {
	if (this._lock) {
		this._lock = false;
		this.message = null;
		this.emit('unlock');
	}
};

Sync.prototype.doSyncAll = function () {
	var now = new Date();
	if (now - this.lastSyncAll < this.intervalSyncAll) {
		this.errorList.add('BatchSyncAll', 'Please run Sync All at intervals for more than 15 minutes all year.');
	} else {
		if (this._lock) {
			this._lock = false;
			this.message = null;
			this.standby = null;
			clearTimeout(this._timer);
		}
		app.flow('BatchSyncAll')();
	}
};

Sync.prototype.doSync = function () {
	clearTimeout(this._timer);
	if (this.standby) {
		this.standby();
		this.standby = null;
	} else {
		if (this.noteList.get()) {
			if (this.lock('Wait', 'Waiting SyncNote.')) {
				this.standby = function () {
					app.flow('BatchSyncNote')();
				};
				var self = this;
				this._timer = setTimeout (function () {
					self.unlock();
				}, this.intervalSyncNote);
			}
		} else {
			if (this.lock('Waiting SyncChunk.')) {
				this.standby = function () {
					app.flow('BatchSyncChunk')();
				};
				var self = this;
				this._timer = setTimeout (function () {
					self.unlock();
				}, this.intervalSyncChunk);
			}
		}
	}
};

var List = function () {
	this._list = {};
};

List.prototype.add = function (key, body) {
	if (key) {
		this._list[key] = body;
	}
};
List.prototype.remove = function (key) {
	if (key) {
		delete(this._list[key]);
	}
};
List.prototype.get = function () {
	for (var i in this._list) {
		return {
			key: i,
			body: this._list[i]
		};
	}
};
List.prototype.all = function () {
	var all = new Array();
	for (var i in this._list) {
		all.push({
			key: i,
			body: this._list[i]
		});
	}
	return all;
};
List.prototype.count = function () {
	var count = 0;
	for (var i in this._list) {
		i && count++;
	}
	return count;
};
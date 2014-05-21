var List = require('./sync/list.js');
var app, sync;

module.exports = function(App) {
	app = App;
	app.on('Model.LoadConfig', function(flow) {
		loadConfig();
		flow.next();
	});
	loadConfig();
	return function() {
		return sync;
	};
};

var loadConfig = function() {
	sync = new Sync();
	sync.duration(10);
};

var Sync = function() {
	this.USN = null;
	this.message = null;
	this.lastSync = null;
	this.lastSyncAll = null;
	this.noteList = new List();
	this.tagList = new List();
	this.errorList = new List();

	this._lock = 0;
	this._syncAllWaitUnlock = false;
	this._duration = 0;
};

Sync.prototype.intervalSyncAll = 15 * 60 * 1000;

Sync.prototype.lock = function(message) {
	if (this._lock) {
		return 0;
	} else {
		this._lock = Math.random() + 1;
		this.message = message;
		return this._lock;
	}
};

Sync.prototype.unlock = function(key) {
	if (this._lock == key) {
		this._lock = false;
		this.message = null;
		if (this._syncAllWaitUnlock) {
			this.doSyncAll();
			this._syncAllWaitUnlock = false;
		}
	}
};

Sync.prototype.doSyncAll = function() {
	this._syncAllWaitUnlock = false;
	var now = new Date();
	if (this._lock) {
		this._syncAllWaitUnlock = true;
	} else if (now - this.lastSyncAll < this.intervalSyncAll) {
		this.errorList.add('BatchSyncAll', 'Please run Sync All at intervals for more than 15 minutes all year.');
	} else {
		app.flow('BatchSyncAll')();
	}
};

Sync.prototype.duration = function(timer) {
	this._duration = timer;
	Sync.timeoutTick(this);
};

Sync.prototype.tick = function() {
	if (!this._lock && this._duration > 0) {
		this._duration--;
		if (this._duration) {
			if (this.noteList.count()) {
				app.flow('BatchSyncNote')();
			} else if (this.tagList.count()) {
				app.flow('BatchSyncTag')();
			}
		} else {
			app.flow('BatchSyncChunk')();
		}
	}
	if (this._duration) {
		Sync.timeoutTick(this);
	}
};

var timer = null;
Sync.timeoutTick = function(sync) {
	clearTimeout(timer);
	timer = setTimeout(function() {
		sync.tick();
	}, 1000);
};
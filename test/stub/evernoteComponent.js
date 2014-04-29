var EventEmitter = require('events').EventEmitter;
var util = require("util");
var EvernoteData = require('./evernoteData');

var stub = module.exports = function() {
	EventEmitter.call(this);
	this.list = new Array();
	this.list.push(new EvernoteData.MetaData('test-guid-1', 'Test Title 1'));

	this.notes = {};

	this.notes['TEST-NOTE'] = new EvernoteData.Note('TEST-NOTE');
	this.notes['DELETED-NOTE'] = new EvernoteData.Note('DELETED-NOTE');
	this.notes['DELETED-NOTE'] = this.notes['DELETED-NOTE'].created;
	this.notes['OTHER-NOTEBOOK'] = new EvernoteData.Note('OTHER-NOTEBOOK');
	this.notes['OTHER-NOTEBOOK'].notebookGuid = 'OTHER-NOTEBOOK-GUID';
};

util.inherits(stub, EventEmitter);

stub.prototype.setNotesCount = function(count) {
	var list = new Array();
	for (var i = 0; i < count; i++) {
		list.push(new EvernoteData.MetaData('test-guid-'+list.length, 'Test Title '+list.length));
	}
	this.list = list;
};

stub.prototype.getSyncState = function(next) {
	this.once('getSyncState', function(input, output) {
		input.next(output.err, output.status);
	});
	var input = {
		next : next
	};
	var output = {
		err : null,
		status : {
			currentTime : new Date(),
			fullSyncBefore : new Date(),
			updateCount : 46,
			uploaded : null
		}
	};
	this.emit('getSyncState', input, output);
};

stub.prototype.getMetaAll = function(offset, next) {
	this.once('getMetaAll', function(input, output) {
		input.next(output.err, output.data);
	});
	var input = {
		offset : offset,
		next : next
	};
	var output = {
		err : null
	};
	output.list = {
		startIndex : offset,
		totalNotes : 0,
		updateCount : 46,
		notes : new Array()
	};
	output.list.totalNotes = this.list.length;
	var i = offset;
	while (i < this.list.length) {
		if (i >= offset + 100)
			break;
		output.list.notes.push(this.list[i]);
		i++;
	}
	this.emit('getMetaAll', input, output);
};

stub.prototype.getSyncChunk = function(usn, next) {
	this.once('getSyncChunk', function(input, output) {
		input.next(output.err, output.list);
	});
	var input = {
		usn : usn,
		next : next
	};
	var output = {
		err : null
	};
	output.list = {
		currentTime : 1398359259647,
		chunkHighUSN : 46,
		updateCount : 46,
		notes : new Array(),
		notebooks: new Array(),
		tags: new Array(),
		searches: null,
		resources: null,
		expungedNotes: null,
		expungedNotebooks: null,
		expungedTags: null,
		expungedSearches: null,
		linkedNotebooks: null,
		expungedLinkedNotebooks: null
	};
	var i = 0;
	while (i < this.list.length) {
		if (i >= 100)
			break;
		output.list.notes.push(this.list[i]);
		i++;
	}
	this.emit('getSyncChunk', input, output);
};

stub.prototype.getNote = function(guid, next) {
	this.once('getNote', function(input, output) {
		input.next(output.err, output.data);
	});
	var input = {
		guid : guid,
		next : next
	};
	var output = {
		err : null
	};
	output.data = null;
	if (guid in self.notes) {
		note = this.notes[guid];
	}
	this.emit('getNote', input, output);
};

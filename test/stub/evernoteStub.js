var EventEmitter = require('events').EventEmitter;
var util = require("util");
var enData = require('./evernoteData.js');

var Client = function(opt) {
	this.token = opt.token;
	this._noteStore = new NoteStore();
};
Client.prototype.getNoteStore = function() {
	return this._noteStore;
};

var NoteStore = function() {
	EventEmitter.call(this);
	var testNote = new enData.Note('TEST-NOTE');
	var deletedNote = new enData.Note('DELETED-NOTE');
	deletedNote.deleted = deletedNote.created;
	var otherNotebook = new enData.Note('OTHER-NOTEBOOK');
	otherNotebook.notebookGuid = 'OTHER-NOTEBOOK-GUID';

	this.notes = {
		'TEST-NOTE' : testNote,
		'DELETED-NOTE' : deletedNote,
		'OTHER-NOTEBOOK' : otherNotebook
	};
};
util.inherits(NoteStore, EventEmitter);

NoteStore.prototype.findNotesMetadata = function(noteFilter, offset, max, notesMetadataResultSpec, next) {
	this.once('findNotesMetadata', function(input, output) {
		input.next(output.err, output.metaData);
	});
	var input = {
		noteFilter : noteFilter,
		offset : offset,
		max : max,
		notesMetadataResultSpec : notesMetadataResultSpec,
		next : next
	};
	var output = {
		err : null,
		push: function (count) {
			for (var i = 0; i < count; i++) {
				this.metaData.notes.push(new enData.MetaData('TEST-GUID-' + i, 'testNote! ' + i));
			};
			this.metaData.notes = this.metaData.notes.slice(offset, offset + 100);
			this.metaData.totalNotes = this.metaData.notes.length;
		}
	};
	output.metaData = {
		startIndex : offset,
		totalNotes : 0,
		notes : new Array(),
		stoppedWords : null,
		searchedWords : null,
		updateCount : 46
	};
	this.emit('findNotesMetadata', input, output);
};

NoteStore.prototype.getFilteredSyncChunk = function(usn, max, filter, next) {
	this.once('getFilteredSyncChunk', function(input, output) {
		input.next(output.err, output.data);
	});
	var input = {
		usn : usn,
		max : max,
		filter : filter,
		next : next
	};
	var output = {
		err : null,
		push: function (count) {
			for (var i = 0; i < count; i++) {
				this.data.notes.push(new enData.MetaData('TEST-GUID-' + i, 'testNote! ' + i));
			};
			this.data.notes = this.data.notes.slice(0, 100);
			this.data.totalNotes = this.data.notes.length;
		}
	};
	output.data = {
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
	this.emit('getFilteredSyncChunk', input, output);
};

NoteStore.prototype.getNote = function(guid, arg1, arg2, arg3, arg4, next) {
	this.once('getNote', function(input, output) {
		input.next(output.err, output.note);
	});
	var input = {
		guid : guid,
		arg1 : arg1,
		arg2 : arg2,
		arg3 : arg3,
		arg4 : arg4,
		next : next
	};
	var output = {
		err : null,
		note : null
	};
	if (guid in this.notes) {
		output.note = this.notes[guid];
	} else {
		output.err = {
			identifier : 'Note.guid',
			key : guid
		};
	}
	this.emit('getNote', input, output);
};

var NoteFilter = function() {
};

var SyncChunkFilter = function () {
};

var NotesMetadataResultSpec = function() {
};

var en = {
	Client : Client,
	NoteFilter : NoteFilter,
	SyncChunkFilter: SyncChunkFilter,
	NotesMetadataResultSpec : NotesMetadataResultSpec
};
var Evernote = module.exports = {
	Evernote : en
};

var enData = require('./evernoteData.js');

var Client = function(opt) {
	this._noteStore = new NoteStore();
};
Client.prototype.getNoteStore = function() {
	return this._noteStore;
};

var NoteStore = function() {
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
NoteStore.prototype.preFindNotesMetadata = function(noteFilter, offset, max, notesMetadataResultSpec, next) {
	next(1);
};
NoteStore.prototype.findNotesMetadata = function(noteFilter, offset, max, notesMetadataResultSpec, next) {
	this.preFindNotesMetadata(noteFilter, offset, max, notesMetadataResultSpec, function(noteCount) {
		var notes = new Array();
		for (var i = 0; i < noteCount; i++) {
			notes.push(new enData.MetaData('TEST-GUID-' + i, 'testNote! ' + i));
		}
		;
		notes = notes.slice(offset, offset + 100);
		var metaData = {
			startIndex : offset,
			totalNotes : noteCount,
			notes : notes,
			stoppedWords : null,
			searchedWords : null,
			updateCount : 46
		};
		next(null, metaData);
	});
};

NoteStore.prototype.preGetNote = function(guid, next) {
	next();
};

NoteStore.prototype.getNote = function(guid, arg1, arg2, arg3, arg4, next) {
	var self = this;
	this.preGetNote(guid, function() {
		if (guid in self.notes) {
			var note = self.notes[guid];
			next(null, note);
		} else {
			next({
				identifier : 'Note.guid',
				key : guid
			});
		}
	});
};

var NoteFilter = function() {
};

var NotesMetadataResultSpec = function() {
};

var en = {
	Client : Client,
	NoteFilter : NoteFilter,
	NotesMetadataResultSpec : NotesMetadataResultSpec
};
var Evernote = module.exports = {
	Evernote : en
};

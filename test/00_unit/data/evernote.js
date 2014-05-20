var Evernote = require('evernote').Evernote;
var NoteStore = Evernote.NoteStoreClient;
var Note = Evernote.Note;
var maxDataLength = -1;
var nextError = null;

NoteStore.prototype.findNotesMetadata = function(noteFilter, offset, max, notesMetadataResultSpec, callback) {
	if (nextError) {
		callback(nextError);
		nextError = null;
	} else {
		var tmpNotes;
		if (maxDataLength >= 0) {
			tmpNotes = notes.slice(0, maxDataLength);
		} else {
			tmpNotes = notes;
		}
		var meta = new Evernote.NotesMetadataList({
			startIndex : offset,
			totalNotes : tmpNotes.length,
			notes : new Array(),
			stoppedWords : null,
			searchedWords : null,
			updateCount : 46
		});
		var i = 0;
		while (i < max && i + offset < tmpNotes.length) {
			meta.notes.push(new Evernote.NoteMetadata(tmpNotes[i + offset]));
			i++;
		}
		maxDataLength = -1;
		callback(null, meta);
	}
};

NoteStore.prototype.getFilteredSyncChunk = function(usn, max, filter, callback) {
	var chunk = new Evernote.SyncChunk({
		currentTime : null,
		chunkHighUSN : 10000,
		updateCount : 12123,
		notes : new Array(),
	});
	var i = 0;
	while (i < max && i < notes.length) {
		chunk.notes.push(notes[i]);
		i++;
	}
	if (i == 0) {
		chunk.notes = null;
	}
	callback(null, chunk);
};

NoteStore.prototype.getNote = function(guid, withContent, withResourcesData, withResourcesRecognition, withResourcesAlternateDat, callback) {
	if (nextError) {
		callback(nextError);
		nextError = null;
	} else {
		var note = null, err = null;
		for ( var i in notes) {
			if (notes[i].guid == guid) {
				note = notes[i];
			}
		}
		if (note == null) {
			err = {
				identifier : 'Note.guid',
				key : guid
			};
		}
		callback(err, note);
	}
};

NoteStore.prototype.getSyncState = function(callback) {
	var state = new Evernote.SyncState({
		currentTime : null,
		fullSyncBefore : null,
		updateCount : 10000,
		uploaded : 0
	});
	callback(null, state);
};

var testAttributes = new Evernote.NoteAttributes({
	subjectDate : null,
	latitude : null,
	longitude : null,
	altitude : null,
	author : 'test-user',
	source : null,
	sourceURL : null,
	sourceApplication : null,
	shareDate : null,
	reminderOrder : null,
	reminderDoneTime : null,
	reminderTime : null,
	placeName : null,
	contentClass : null,
	applicationData : null,
	lastEditedBy : null,
	classifications : null,
	creatorId : null,
	lastEditorId : null
});

var notes = new Array();
var notePush = function() {
	return {
		guid : 'TEST-NOTE-GUID-' + notes.length,
		title : 'TEST-TITLE-' + notes.length,
		created : 1391939596000,
		updated : 1392119875000,
		notebookGuid : 'TEST-NOTEBOOK-GUID',
	};
};

notes.push(new Note({
	guid : 'TEST-NOTE-GUID-0',
	title : 'TEST-TITLE-0',
	content : '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note><div>これがてすとです。</div><div><br clear="none"/></div><div><br clear="none"/><en-media hash="42237621d7a569c19acc67f04a2db2d8" type="image/png"></en-media></div></en-note>',
	contentHash : null,
	contentLength : null,
	created : 1391939596000,
	updated : 1392119875000,
	deleted : null,
	active : true,
	updateSequenceNum : 48,
	notebookGuid : 'TEST-NOTEBOOK-GUID',
	tagGuids : [ 'TAG-GUID', 'PUBLISH-GUID' ],
	resources : [],
	attributes : testAttributes,
	tagNames : []
}));

for (var i = 0; i < 300; i++) {
	notes.push(new Note(notePush()));
};

notes.push(new Note({
	guid : 'OTHER-NOTEBOOK',
	title : 'OTHER NOTEBOOK NOTE',
	content : '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note><div>これがてすとです。</div><div><br clear="none"/></div><div><br clear="none"/><en-media hash="42237621d7a569c19acc67f04a2db2d8" type="image/png"></en-media></div></en-note>',
	contentHash : null,
	contentLength : null,
	created : 1391939596000,
	updated : 1392119875000,
	deleted : null,
	active : true,
	updateSequenceNum : 48,
	notebookGuid : 'OTHER-NOTEBOOK-GUID',
	tagGuids : [ 'TAG-GUID', 'PUBLISH-GUID' ],
	resources : [],
	attributes : testAttributes,
	tagNames : []
}));

notes.push(new Note({
	guid : 'DELETED-NOTE',
	title : 'DELETED NOTEBOOK NOTE',
	content : '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note><div>これがてすとです。</div><div><br clear="none"/></div><div><br clear="none"/><en-media hash="42237621d7a569c19acc67f04a2db2d8" type="image/png"></en-media></div></en-note>',
	contentHash : null,
	contentLength : null,
	created : 1391939596000,
	updated : 1392119875000,
	deleted : 1392119875000,
	active : true,
	updateSequenceNum : 48,
	notebookGuid : 'OTHER-NOTEBOOK-GUID',
	tagGuids : [ 'TAG-GUID', 'PUBLISH-GUID' ],
	resources : [],
	attributes : testAttributes,
	tagNames : []
}));

module.exports.nextDataLength = function(length) {
	maxDataLength = length;
};

module.exports.nextError = function(err) {
	nextError = err;
};
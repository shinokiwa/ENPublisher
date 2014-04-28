var stub = module.exports = function() {
	this.list = [ {
		guid : 'test-guid-01',
		title : 'Test Title 01!'
	} ];

	var testNote = new Note('TEST-NOTE');
	var deletedNote = new Note('DELETED-NOTE');
	deletedNote.deleted = deletedNote.created;
	var otherNotebook = new Note('OTHER-NOTEBOOK');
	otherNotebook.notebookGuid = 'OTHER-NOTEBOOK-GUID';

	this.notes = {
		'TEST-NOTE' : testNote,
		'DELETED-NOTE' : deletedNote,
		'OTHER-NOTEBOOK' : otherNotebook
	};
};

stub.prototype.setNotesCount = function(count) {
	var list = new Array();
	for (var i = 0; i < count; i++) {
		list.push(this.list[0]);
	}
	this.list = list;
};

stub.prototype.preGetMetaAll = function(offset, next) {
	next();
};

stub.prototype.getMetaAll = function(offset, next) {
	var list = {
		startIndex : offset,
		totalNotes : 0,
		updateCount : 46,
		notes : new Array()
	};
	list.totalNotes = this.list.length;
	var i = offset;
	while (i < this.list.length) {
		if (i >= offset + 100)
			break;
		list.notes.push(this.list[i]);
		i++;
	}
	this.preGetMetaAll(offset, function() {
		next(null, list);
	});
};

stub.prototype.preGetNote = function(guid, next) {
	next();
};

stub.prototype.getNote = function(guid, next) {
	var self = this;
	this.preGetNote(guid, function(err) {
		if (err) {
			next(err, null);
		} else {
			var note = null;
			if (guid in self.notes) {
				note = self.notes[guid];
			}
			next(null, note);
		}
	});
};

var Note = function(guid) {
	this.guid = guid;
};

Note.prototype = {
	guid : null,
	title : 'testNote!',
	content : '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\n<en-note><div>これがてすとです。</div><div><br clear="none"/></div><div><br clear="none"/><en-media hash="42237621d7a569c19acc67f04a2db2d8" type="image/png"></en-media></div></en-note>',
	contentHash : {},
	contentLength : 280,
	created : 1391939596000,
	updated : 1392119875000,
	deleted : null,
	active : true,
	updateSequenceNum : 30,
	notebookGuid : 'COLLECT-NOTEBOOK',
	tagGuids : [ 'TAG-GUID', 'PUBLISH-GUID' ],
	resources : [ {
		guid : '',
		noteGuid : '',
		data : {},
		mime : 'image/png',
		width : 842,
		height : 579,
		duration : null,
		active : true,
		recognition : null,
		attributes : null,
		updateSequenceNum : 32,
		alternateData : null
	} ],
	attributes : {
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
	},
	tagNames : null
};

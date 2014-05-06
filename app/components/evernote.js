var Evernote;

var Client = function(client, notebook, published) {
	this._client = client;
	this._notebook = notebook;
	this._published = published;
};

Client.prototype.getSyncState = function (next) {
	var noteStore = this._client.getNoteStore();
	noteStore.getSyncState(next);
};

Client.prototype.getSyncChunk = function (usn, next){
	var noteStore = this._client.getNoteStore();
	var filter = new Evernote.SyncChunkFilter();
	filter.includeNotebooks = false;
	filter.includeNotes = true;
	filter.includeTags = true;
	noteStore.getFilteredSyncChunk(usn, 100, filter, next);
};

Client.prototype.getMetaAll = function(offset, next) {
	var noteStore = this._client.getNoteStore();
	var noteFilter = new Evernote.NoteFilter();
	noteFilter.notebookGuid = this._notebook;
	var notesMetadataResultSpec = new Evernote.NotesMetadataResultSpec();
	notesMetadataResultSpec.includeTitle = true;
	notesMetadataResultSpec.includeUpdateSequenceNum = true;
	noteStore.findNotesMetadata(noteFilter, offset, 100, notesMetadataResultSpec, next);
};

Client.prototype.getNote = function(guid, next) {
	var noteStore = this._client.getNoteStore();
	var self = this;
	noteStore.getNote(guid, true, true, false, false, function(err, data) {
		if (err) {
			if ('identifier' in err && err.identifier == 'Note.guid') {
				next(null, null);
			} else {
				next(err, null);
			}
		} else {
			if (data && data.notebookGuid == self._notebook && data.deleted == null) {
				var note = {
					guid : data.guid,
					title : data.title,
					content : data.content,
					created : data.created,
					updated : data.updated,
					deleted : data.deleted,
					updateSequenceNum : data.updateSequenceNum,
					tagGuids : data.tagGuids,
					resources : data.resources,
				};
				next(null, note);
			} else {
				next(null, null);
			}
		}
	});
};

module.exports = function(EvernoteModule, token, notebookGUID, publishedGUID, sandbox) {
	Evernote = EvernoteModule.Evernote;
	var evernoteClient = new Evernote.Client({
		token : token,
		sandbox: sandbox
	});
	var client = new Client(evernoteClient, notebookGUID, publishedGUID);
	return function() {
		return client;
	};
};
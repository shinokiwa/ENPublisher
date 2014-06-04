var Evernote = require ('evernote').Evernote;
var token, publishedGuid, notebookGuid, sandbox, noteStoreUrl;

module.exports = function(app) {
	app.configure(loadConfig);
	return function() {
		var client = new Client();
		client._client = new Evernote.Client({
			token : token,
			sandbox: sandbox,
		});
		return client;
	};
};

var loadConfig = function (configure, next) {
	var conf = configure.evernote;
	token = conf.token;
	notebookGuid = conf.notebookGuid;
	publishedGuid = conf.publishedGuid;
	sandbox = conf.sandbox;
	noteStoreUrl = conf.noteStoreUrl;
	next();
};

var Client = function() {
};

Client.prototype.getMetaAll = function(offset, next) {
	var noteStore = this._client.getNoteStore(noteStoreUrl);
	var noteFilter = new Evernote.NoteFilter();
	noteFilter.notebookGuid = notebookGuid;
	var notesMetadataResultSpec = new Evernote.NotesMetadataResultSpec();
	notesMetadataResultSpec.includeTitle = true;
	notesMetadataResultSpec.includeUpdateSequenceNum = true;
	noteStore.findNotesMetadata(noteFilter, offset, 100, notesMetadataResultSpec, next);
};

Client.prototype.getSyncState = function (next) {
	var noteStore = this._client.getNoteStore(noteStoreUrl);
	noteStore.getSyncState(next);
};

Client.prototype.getSyncChunk = function (usn, next){
	var noteStore = this._client.getNoteStore(noteStoreUrl);
	var filter = new Evernote.SyncChunkFilter();
	filter.includeNotebooks = false;
	filter.includeNotes = true;
	filter.includeTags = true;
	noteStore.getFilteredSyncChunk(usn, 100, filter, next);
};

Client.prototype.getNote = function(guid, next) {
	var noteStore = this._client.getNoteStore(noteStoreUrl);
	noteStore.getNote(guid, true, true, false, false, function(err, data) {
		if (err) {
			if ('identifier' in err && err.identifier == 'Note.guid') {
				next(null);
			} else {
				next(err, data);
			}
		} else {
			if (data && data.notebookGuid == notebookGuid && data.deleted == null) {
				next(null, data);
			} else {
				next(null, null);
			}
		}
	});
};

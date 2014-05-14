var Evernote, token, publishedGuid, notebookGuid, sandbox;
var ENClient;

module.exports = function(app, evernoteModule) {
	Evernote = evernoteModule.Evernote;
	app.on('Model.LoadConfig', loadConfig);
	return function() {
		var client = new Client();
		return client;
	};
};

var loadConfig = function (flow, request, response) {
	var conf = flow.locals.configure.evernote;
	token = conf.token;
	notebookGuid = conf.notebookGuid;
	publishedGuid = conf.publishedGuid;
	sandbox = conf.sandbox;
	ENClient = new Evernote.Client({
		token : token,
		sandbox: sandbox
	});
	flow.next();
};

var Client = function() {
};

Client.prototype.getMetaAll = function(offset, next) {
	var noteStore = ENClient.getNoteStore();
	var noteFilter = new Evernote.NoteFilter();
	noteFilter.notebookGuid = notebookGuid;
	var notesMetadataResultSpec = new Evernote.NotesMetadataResultSpec();
	notesMetadataResultSpec.includeTitle = true;
	notesMetadataResultSpec.includeUpdateSequenceNum = true;
	noteStore.findNotesMetadata(noteFilter, offset, 100, notesMetadataResultSpec, next);
};

Client.prototype.getSyncState = function (next) {
	var noteStore = ENClient.getNoteStore();
	noteStore.getSyncState(next);
};

Client.prototype.getSyncChunk = function (usn, next){
	var noteStore = ENClient.getNoteStore();
	var filter = new Evernote.SyncChunkFilter();
	filter.includeNotebooks = false;
	filter.includeNotes = true;
	filter.includeTags = true;
	noteStore.getFilteredSyncChunk(usn, 100, filter, next);
};

Client.prototype.getNote = function(guid, next) {
	var noteStore = ENClient.getNoteStore();
	noteStore.getNote(guid, true, true, false, false, function(err, data) {
		if (err) {
			if ('identifier' in err && err.identifier == 'Note.guid') {
				next(null, null);
			} else {
				next(err, null);
			}
		} else {
			if (data && data.notebookGuid == notebookGuid && data.deleted == null) {
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

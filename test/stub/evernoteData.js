var MetaData = function (guid, title) {
	this.guid = guid;
	this.title = title;
};
MetaData.prototype = {
		guid : null,
		title : null,
		contentLength : null,
		created : null,
		updated : null,
		deleted : null,
		updateSequenceNum : null,
		notebookGuid : null,
		tagGuids : null,
		attributes : null,
		largestResourceMime : null,
		largestResourceSize : null
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


module.exports = {
	MetaData: MetaData,
	Note: Note
};
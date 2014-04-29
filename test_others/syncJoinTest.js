// 実際にEvernoteから情報を取得してDBに保存するため、mochaの一括テストから外しておく。
var ENPublisher = require('../app/index.js');
var app = ENPublisher.create(__dirname + '/../configure.json');

var flow = null;
app.on('Model.BatchSyncAll', function(input, output, next) {
	flow = 'BatchSyncAll';
	next();
});

app.on('Model.BatchSyncNote', function(input, output, next) {
	flow = 'BatchSyncNote';
	next();
});

app.on('Model.BatchSyncChunk', function(input, output, next) {
	flow = 'BatchSyncChunk';
	next();
});

app.on('After.Model', function(input, output, next) {
	var sync = input.components.sync();
//	var post = input.components.post();
	console.log('#### ' + flow + ' ####');
	console.log('Queued Notes:');
	console.log(sync.queuedNotes);
	console.log('Errors:');
	console.log(sync.error);
	console.log('Messages:');
	console.log(sync.message);
	console.log('USN:');
	console.log(sync.USN);
	console.log('LastSync:');
	console.log(sync.lastSyncTime);
	flow = null;
	next();
});

app.flow('BatchSyncAll')({}, {});

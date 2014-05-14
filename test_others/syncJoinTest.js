// 実際にEvernoteから情報を取得してDBに保存するため、mochaの一括テストから外しておく。
var ENPublisher = require('../app/index.js');
var app = ENPublisher.create(__dirname + '/../configure.json');

var check = {
	Controller : function(flow) {
		console.log('flow', flow.name, 'start');
		flow.next();
	},
	View : function(flow) {
		var sync = flow.use('Sync');
		console.log('USN', sync.USN);
		var cnt = sync.noteList.count();
		console.log('notes', cnt);
		if (cnt) {
			console.log('notes[0]', sync.noteList.get());
		}
		console.log('errors', sync.errorList.all());
		console.log('lastSyncAll', sync.lastSyncAll);
		console.log('lastSync', sync.lastSync);
		console.log('flow', flow.name, 'end');
		flow.next();
	}
};

app.add('BatchSyncAll', check);
app.add('BatchSyncNote', check);
app.add('BatchSyncChunk', check);

app.on('Controller.TestSync', function(flow) {
	var sync = flow.use('Sync');
//	sync.doSyncAll();
	flow.next();
});

app.flow('LoadConfig')();
setTimeout(function() {
	app.flow('TestSync')();
}, 3000);

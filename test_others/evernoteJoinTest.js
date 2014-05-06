// 実際にEvernoteから情報を取得するため、mochaの一括テストから外しておく。
var ENPublisher = require('../app/index.js');
var app = ENPublisher.create (__dirname+ '/../configure.json');

app.on('Model.EvernoteTest', function (input, output, next) {
	var evernote = input.components.evernote();
	evernote.getMetaAll (0, function (err, data) {
		console.log ('err:', err);
		console.log ('data:', data);
		next();
	});
});

app.flow('EvernoteTest')({}, {});

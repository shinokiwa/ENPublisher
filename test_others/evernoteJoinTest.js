// 実際にEvernoteから情報を取得するため、mochaの一括テストから外しておく。
var ENPublisher = require('../app/index.js');
var app = ENPublisher.create (__dirname+ '/../configure.json');

app.on('Model.EvernoteTest', function (input, output, next) {
	var evernote = input.components.evernote();
	evernote.getNote ('f78e27a0-a04b-428f-8298-7486ec753123', function (err, data) {
		console.log ('err:', err);
		console.log ('data:', data);
		next();
	});
});

app.flow('EvernoteTest')({}, {});

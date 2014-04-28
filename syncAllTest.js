var ENPublisher = require('./app/index.js');
var app = ENPublisher.create ();

app.on('After.Model', function (input, output, next) {
	var sync = input.components.sync();
	console.log (sync.queuedNotes);
});

app.flow('BatchSyncAll')({}, {});

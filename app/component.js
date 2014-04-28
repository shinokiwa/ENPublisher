module.exports = function (app, configure) {
	app.on('After.Controller', function(request, input, next) {
		if (!input.components) input.components = {};

		input.components.session = require ('./components/session.js')(request);
		
		input.components.login = require ('./components/login.js')(configure.get('Login.ID'), configure.get('Login.Password'));

		input.components.sync = require ('./components/sync.js')(app);

		var Evernote = require('evernote');
		var token = configure.get('Evernote.Token');
		var notebook = configure.get('Evernote.NotebookGUID');
		var tag = configure.get('Evernote.PublishedGUID');
		input.components.evernote = require ('./components/evernote.js')(Evernote, token, notebook, tag);

		var host = configure.get('Mongoose.Host');
		var database = configure.get('Mongoose.Database');
		var port = configure.get('Mongoose.Port');
		var mongoose = input.components.mongoose = require ('./components/mongoose.js')(host, database, port);
		
		input.components.post = require ('./components/post.js')(mongoose, tag);
		
		next&&next();
	});
};
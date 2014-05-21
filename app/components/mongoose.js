var mongoose = require ('mongoose');
var db = mongoose.createConnection();
var PostSchema = require ('./mongooses/postSchema.js');
db.model('Post', PostSchema);

db.on('connected', function () {
	console.log ('Database connected');
}).on('disconnected', function () {
	console.log ('Database disconnected');
});

var host, database,port;

var load = function (flow) {
	host = flow.locals.configure.mongoose.host;
	database = flow.locals.configure.mongoose.database;
	port = flow.locals.configure.mongoose.port;
	var Post = db.model('Post');
	Post.setPublished(flow.locals.configure.evernote.publishedGuid);
	Post.setSiteDomain(flow.locals.configure.site.domain);
	flow.next();
};

module.exports = function (app) {
	app.on('Model.LoadConfig', load);
	return function () {
		if (db._readyState == 0 || db._readyState == 3) {
			db.open(host, database, port);
		}
		return db;
	};
};
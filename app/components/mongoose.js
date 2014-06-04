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

var load = function (configure,next) {
	host = configure.mongoose.host;
	database = configure.mongoose.database;
	port = configure.mongoose.port;
	var Post = db.model('Post');
	Post.setPublished(configure.evernote.publishedGuid);
	Post.setSiteDomain(configure.site.domain);
	next();
};

module.exports = function (app) {
	app.configure(load);
	return function () {
		if (db._readyState == 0 || db._readyState == 3) {
			db.open(host, database, port);
		}
		return db;
	};
};
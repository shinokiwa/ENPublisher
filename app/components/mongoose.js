var mongoose = require ('mongoose');
var db = mongoose.createConnection();
var PostSchema = require ('./mongooses/postsSchema.js');
db.model('Post', PostSchema);

db.on('open', function () {
	console.log ('mongoose://'+db.host+':'+db.port+'/ Connected.');
});

db.on('close', function () {
	console.log ('mongoose://'+db.host+':'+db.port+'/ Disconnected.');
});

module.exports = function (host, database, port) {
	return function () {
		if (db._readyState == 0) {
			db.open(host, database, port);
		}
		return db;
	};
};
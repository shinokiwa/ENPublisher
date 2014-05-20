var fakeApp = {
		on: function () {}
};
var openDB = (function () {
	if (process.env.TEST_COV) {
		return require(__dirname+'/../../../app-cov/components/mongoose.js')(fakeApp);
	} else {
		return require(__dirname+'/../../../app/components/mongoose.js')(fakeApp);
	}
})();

module.exports.init = function(callback) {
	var db = openDB();
	var Post = db.model('Post');
	Post.remove({}, function(err) {
		Post.create(data, function(err) {
			callback();
		});
	});
};

var data = [ {
	guid : 'TEST-DB-NOTE-GUID-1',
	title : 'TEST-DB-TITLE-1',
	tags : [ {
		guid : 'TEST-PUBLISHED-GUID'
	} ]
} ];

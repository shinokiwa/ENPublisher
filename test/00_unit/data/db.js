module.exports = function(app, callback) {
	var Post = app.use('Database').model('Post');
	Post.remove({}, function(err) {
		Post.create(datas, function(err) {
			callback();
		});
	});
};

var dataPush = function() {
	return {
		guid : 'TEST-DB-NOTE-GUID-' + datas.length,
		title : 'TEST-DB-TITLE-' + datas.length,
		created : 1391939596000,
		updated : 1392119875000,
		tags : [ {
			guid : 'TEST-PUBLISHED-GUID'
		} ]
	};
};

var datas = [];
for (var i = 0; i < 31; i++) {
	datas.push(dataPush());
};

datas.push({
	guid : 'TEST-DB-NOTE-GUID-65',
	title : 'TEST-DB-TITLE-65',
	created : 1391939596000,
	updated : 1392119875000,
	tags : []
});

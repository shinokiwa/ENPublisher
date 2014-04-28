var mongoose = require ('./app/components/mongoose.js');
var dbCom = mongoose('localhost', 'test', null);
var db = dbCom();
var Post = db.model('Post');
var post = new Post({
	guid: 'test1',
	url : 'test'
});
post.save(function(err) {
	console.log(err);
	var post2 = new Post({
		guid: 'test2',
		url : 'test2'
	});
	post2.save(function(err) {
		console.log(err);
		var post3 = new Post({
			guid: 'test3',
			url : 'test2'
		});
		post3.save(function(err) {
			console.log(err);
		});
	});
});

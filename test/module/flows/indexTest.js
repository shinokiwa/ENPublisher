var flow = require('../../../app/flows/index.js');

var Input = require ('../../stub/input.js');
var input, db,output;
var clear = function () {
	input = new Input();
	db = input.components.database();
	output = {};
};


describe('flows.index', function() {
	describe('#controller', function() {
		it('GETクエリからページ数を取得してモデルに送信する。');
		it('GETクエリに指定がない場合は0ページが渡される。', function (done) {
			clear();
			flow.controller({}, input, function () {
				input.should.have.property('page', 0);
				done();
			});
		});
	});	
	describe('#model', function() {
		it('view:trueとなっているポストを20件取得する。同時に同条件のポストの件数も取得する。', function (done) {
			clear();
			var check1 = false;
			var check2 = false;
			db.on('Post.count', function (input, output) {
				input.conditions.should.have.property('view', true);
				output.data = 40;
				check1 = true;
			});
			db.on('Post.find', function (input, output) {
				input.conditions.should.have.property('view', true);
				input.options.should.have.property('skip', 0);
				input.options.should.have.property('limit', 20);
				output.data = [];
				for (var i=0; i < input.options.limit; i++) {
					output.data.push ({});
				}
				check2 = true;
			});
			flow.model(input, output, function () {
				output.should.have.property('posts');
				output.posts.should.have.property('startIndex', 0);
				output.posts.should.have.property('totalPosts', 40);
				output.posts.should.have.property('posts').with.length(20);
				check1.should.be.ok;
				check2.should.be.ok;
				done();
			});
		});
	});	
});
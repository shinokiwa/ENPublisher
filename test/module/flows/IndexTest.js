var flow = require('../../../app/flows/Index.js');
var Stub = require ('../../stub/index.js');
var stub;

describe('Flows.Index', function() {
	beforeEach (function () {
		stub = Stub();
	});
	describe('#controller', function() {
		it('GETクエリからページ数を取得してオフセットを算出し、response.locals.pageとstartIndexに保存する。', function (done) {
			stub.request.query.page = 5;
			stub.flow.next =function (){
				stub.response.locals.should.have.property('page', 5);
				stub.response.locals.should.have.property('startIndex', 100);
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('GETクエリに指定がない場合は0ページが渡される。', function (done) {
			stub.flow.next =function (){
				stub.response.locals.should.have.property('page', 0);
				stub.response.locals.should.have.property('startIndex', 0);
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
	});	
	describe('#model', function() {
		describe('#countPosts', function() {
			it('公開指定のポストの件数を取得して、resposnse.locals.totalPostsに保存する。', function (done) {
				var db = stub.flow.use('Database');
				var countCheck = false;
				db.once('Post.count', function (input, output) {
					input.conditions.should.have.property('published', true);
					output.data = 40;
					countCheck = true;
				});
				
				stub.flow.next = function () {
					countCheck.should.be.ok;
					stub.response.locals.should.have.property('totalPosts', 40);
					done();
				};
				flow.Model.countPosts(stub.flow, stub.request, stub.response);
			});
		});
		describe('#getPosts', function() {
			it('公開指定のポストを20件取得して、resposnse.locals.postsに保存する。', function (done) {
				var db = stub.flow.use('Database');

				stub.response.locals.startIndex = 40;
				var findCheck = false;
				db.once('Post.find', function (input, output) {
					input.conditions.should.have.property('published', true);
					input.options.should.have.property('skip', 40);
					input.options.should.have.property('limit', 20);
					input.options.should.have.property('sort');
					input.options.sort.should.have.property('created', -1);
					output.data = [];
					for (var i=0; i < input.options.limit; i++) {
						output.data.push ({});
					}
					findCheck = true;
				});
				
				stub.flow.next = function () {
					findCheck.should.be.ok;
					stub.response.locals.should.have.property('posts').and.length(20);
					done();
				};
				flow.Model.getPosts(stub.flow, stub.request, stub.response);
			});
		});
		describe('#recentPosts', function() {
			it('公開指定のポストを最新から20件、urlとtitleのみ取得して、resposnse.locals.recentPostsに保存する。', function (done) {
				var db = stub.flow.use('Database');

				var findCheck = false;
				db.once('Post.find', function (input, output) {
					input.conditions.should.have.property('published', true);
					input.options.should.not.have.property('skip');
					input.options.should.have.property('limit', 20);
					input.options.should.have.property('sort');
					input.options.sort.should.have.property('created', -1);
					input.fields.should.have.property('url', 1);
					input.fields.should.have.property('title', 1);
					output.data = [];
					for (var i=0; i < input.options.limit; i++) {
						output.data.push ({});
					}
					findCheck = true;
				});

				stub.flow.next = function () {
					findCheck.should.be.ok;
					stub.response.locals.should.have.property('recentPosts').and.length(20);
					done();
				};
				flow.Model.recentPosts(stub.flow, stub.request, stub.response);
			});
		});	
	});	
});
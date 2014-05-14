var flow = require('../../../app/flows/Post.js');
var Stub = require('../../stub/index.js');
var stub;

describe('Flows.Post', function() {
	beforeEach(function() {
		stub = Stub();
	});
	describe('#Controller', function() {
		it('urlパラメータから指定のポストurlを取得して、flow.locals.urlに保持する。', function(done) {
			stub.request.params.url = 'aaa';
			stub.flow.next = function() {
				stub.flow.locals.should.have.property('url', 'aaa');
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('urlパラメータはURLエンコードされる。', function(done) {
			stub.request.params.url = 'aaa/bbb';
			stub.flow.next = function() {
				stub.flow.locals.should.have.property('url', 'aaa%2Fbbb');
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('urlパラメータがない時はflow.locals.urlは生成されない。', function(done) {
			stub.request.params.url = '';
			stub.flow.next = function() {
				stub.flow.locals.should.not.have.property('url');
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
	});
	describe('#Model', function() {
		describe('#getPost', function() {
			it('公開指定のポストをflow.locals.urlで取得し、resposnse.locals.postsに保持する。', function(done) {
				var db = stub.flow.use('Database');
				stub.flow.locals.url = 'abc';
				var findCheck = false;
				db.once('Post.findOne', function(input, output) {
					input.conditions.should.have.property('published', true);
					input.conditions.should.have.property('url', 'abc');
					output.data = {
						title : 'test!'
					};
					findCheck = true;
				});

				stub.flow.next = function() {
					findCheck.should.be.ok;
					stub.response.locals.should.have.property('post');
					stub.response.locals.post.should.have.property('title', 'test!');
					done();
				};
				flow.Model.getPost(stub.flow, stub.request, stub.response);
			});
			it('ポストが見つからない時は何もしない。', function(done) {
				var db = stub.flow.use('Database');
				stub.flow.locals.url = 'abc';
				var findCheck = false;
				db.once('Post.findOne', function(input, output) {
					input.conditions.should.have.property('published', true);
					input.conditions.should.have.property('url', 'abc');
					findCheck = true;
				});

				stub.flow.next = function() {
					findCheck.should.be.ok;
					stub.response.locals.should.not.have.property('post');
					done();
				};
				flow.Model.getPost(stub.flow, stub.request, stub.response);
			});
			it('flow.locals.urlがない時は何もしない。', function(done) {
				var db = stub.flow.use('Database');
				var findCheck = false;
				db.once('Post.findOne', function(input, output) {
					findCheck = true;
				});

				stub.flow.next = function() {
					findCheck.should.eql(false);
					stub.response.locals.should.not.have.property('post');
					done();
				};
				flow.Model.getPost(stub.flow, stub.request, stub.response);
			});
		});
		describe('#recentPosts', function() {
			it('公開指定のポストを最新から20件、urlとtitleのみ取得して、resposnse.locals.recentPostsに保存する。', function(done) {
				var db = stub.flow.use('Database');

				var findCheck = false;
				db.once('Post.find', function(input, output) {
					input.conditions.should.have.property('published', true);
					input.options.should.not.have.property('skip');
					input.options.should.have.property('limit', 20);
					input.options.should.have.property('sort');
					input.options.sort.should.have.property('created', -1);
					input.fields.should.have.property('url', 1);
					input.fields.should.have.property('title', 1);
					output.data = [];
					for (var i = 0; i < input.options.limit; i++) {
						output.data.push({});
					}
					findCheck = true;
				});

				stub.flow.next = function() {
					findCheck.should.be.ok;
					stub.response.locals.should.have.property('recentPosts').and.length(20);
					done();
				};
				flow.Model.recentPosts(stub.flow, stub.request, stub.response);
			});
		});
	});
	describe('#View', function() {
		it('response.locals.postが存在する時はpostテンプレートを表示する。', function(done) {
			var check = false;
			stub.response.locals.post = {
				title : 'test!'
			};
			stub.response.render = function(template, params) {
				template.should.eql('post');
				params.should.have.property('post');
				params.post.should.have.property('title', 'test!');
				check = true;
			};
			stub.flow.next = function () {
				check.should.be.ok;
				done();
			};
			flow.View(stub.flow, stub.request, stub.response);
		});
		it('output.postが存在しない時はerror404テンプレートを表示する。', function(done) {
			var checkRender = false;
			var checkStatus = false;
			stub.response.render = function(template, params) {
				template.should.eql('error404');
				params.should.not.have.property('post');
				checkRender = true;
			};
			stub.response.status = function(errCode) {
				errCode.should.eql(404);
				checkStatus = true;
			};
			stub.flow.next = function () {
				checkRender.should.be.ok;
				checkStatus.should.be.ok;
				done();
			};
			flow.View(stub.flow, stub.request, stub.response);
		});
	});
});
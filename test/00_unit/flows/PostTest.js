var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var sinon = lib.sinon;
var App = lib.require('app.js');
var flow, app, request, response;
var nextFlow = function () {
	throw new Error ('nextFlow shoud not be called.');
};

before(function (done) {
	app = lib.create(__dirname + '/../unittest.configure.json');
	app.ready(function(next) {
		flow = new app.flows.Post();
		lib.databaseInit(flow, function() {
			next();
			done();
		});
	});
	app.process();
});

describe('flows/Post', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.Post();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('urlパラメータから指定のポストurlを取得して、this.urlに保持する。', function(done) {
			request.params.url = 'aaa';
			var next = function() {
				expect(flow).to.have.property('url', 'aaa');
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
		it('urlパラメータはURLエンコードされる。', function(done) {
			request.params.url = 'aaa/bbb';
			var next = function() {
				expect(flow).to.have.property('url', 'aaa%2Fbbb');
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
		it('urlパラメータがない時はflow.locals.urlは生成されない。', function(done) {
			request.params.url = '';
			var next = function() {
				expect(flow).to.not.have.property('url');
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
	});
	describe('#Model', function() {
		describe('#getPost', function() {
			it('公開指定のポストをflow.locals.urlで取得し、resposnse.locals.postsに保持する。', function(done) {
				flow.url = 'TEST-TITLE-4';
				var next = function() {
					expect(response.locals).to.have.property('post');
					expect(response.locals.post).to.have.property('title', 'TEST-TITLE-4');
					done();
				};
				flow.Model.getPost.apply(flow, [request, response, nextFlow, next]);
			});
			it('ポストが見つからない時は何もしない。', function(done) {
				flow.url = 'abc';
				var next = function() {
					expect(response.locals).to.not.have.property('post');
					done();
				};
				flow.Model.getPost.apply(flow, [request, response, nextFlow, next]);
			});
			it('flow.locals.urlがない時は何もしない。', function(done) {
				var next = function() {
					expect(response.locals).to.not.have.property('post');
					done();
				};
				flow.Model.getPost.apply(flow, [request, response, nextFlow, next]);
			});
		});
		describe('#recentPosts', function() {
			it('公開指定のポストを最新から20件、urlとtitleのみ取得して、resposnse.locals.recentPostsに保存する。', function(done) {
				var next = function() {
					expect(response.locals).to.have.property('recentPosts').and.length(20);
					done();
				};
				flow.Model.recentPosts.apply(flow, [ request, response, nextFlow, next ]);
			});
		});
	});
	describe('#View', function() {
		it('response.locals.postが存在する時はpostテンプレートを表示する。', function(done) {
			var check = false;
			response.locals.post = {
				title : 'test!'
			};
			response.render = function(template, params) {
				expect(template).to.eql('post');
				expect(params).to.have.property('post');
				expect(params.post).to.have.property('title', 'test!');
				check = true;
			};
			var next = function () {
				expect(check).to.eql(true);
				done();
			};
			flow.step('View', next)(request, response, nextFlow);
		});
		it('output.postが存在しない時はerror404テンプレートを表示する。', function(done) {
			var checkRender = false;
			var checkStatus = false;
			response.render = function(template, params) {
				expect(template).to.eql('error404');
				expect(params).to.not.have.property('post');
				checkRender = true;
			};
			response.status = function(errCode) {
				expect(errCode).to.eql(404);
				checkStatus = true;
			};
			var next = function () {
				expect(checkRender).to.eql(true);
				expect(checkStatus).to.eql(true);
				done();
			};
			flow.step('View', next)(request, response, nextFlow);
		});
	});
});
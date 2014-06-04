var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var sinon = lib.sinon;
var flow, app, request, response;
var nextFlow = function () {
	throw new Error ('nextFlow shoud not be called.');
};

before(function (done) {
	app = lib.create(__dirname + '/../unittest.configure.json');
	app.ready(function(next) {
		flow = new app.flows.Index();
		lib.databaseInit(flow, function() {
			next();
			done();
		});
	});
	app.process();
});

describe('flows/Index', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.Index();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#controller', function() {
		it('GETクエリからページ数を取得してオフセットを算出し、response.locals.pageとstartIndexに保存する。', function(done) {
			request.query.page = 5;
			var next = function() {
				expect(response.locals).to.have.property('page', 5);
				expect(response.locals).to.have.property('startIndex', 100);
				done();
			};
			flow.Controller(request, response, nextFlow, next);
		});
		it('GETクエリに指定がない場合は0ページが渡される。', function(done) {
			var next = function() {
				expect(response.locals).to.have.property('page', 0);
				expect(response.locals).to.have.property('startIndex', 0);
				done();
			};
			flow.Controller(request, response, nextFlow, next);
		});
	});
	describe('#model', function() {
		describe('#countPosts', function() {
			it('公開指定のポストの件数を取得して、resposnse.locals.totalPostsに保存する。', function(done) {
				var next = function() {
					expect(response.locals).to.have.property('totalPosts', 31);
					done();
				};
				flow.Model.countPosts.apply(flow, [ request, response, nextFlow, next ]);
			});
		});
		describe('#getPosts', function() {
			it('公開指定のポストを20件取得して、resposnse.locals.postsに保存する。', function(done) {
				var next = function() {
					expect(response.locals).to.have.property('posts').and.length(20);
					done();
				};
				flow.Model.getPosts.apply(flow, [ request, response, nextFlow, next ]);
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
	describe('#flow', function() {
		it('ControllerからViewまでの接続確認', function(done) {
			var check = false;
			response.render = function (template) {
				expect(template).to.eql('index');
				check = true;
			};
			var next = function() {
				expect(check).to.eql(true);
				expect(response.locals).to.have.property('page', 0);
				expect(response.locals).to.have.property('startIndex', 0);
				expect(response.locals).to.have.property('totalPosts', 31);
				expect(response.locals).to.have.property('posts').and.length(20);
				expect(response.locals).to.have.property('recentPosts').and.length(20);
				done();
			};
			app.flow('Index', next)(request, response, nextFlow);
		});
	});
});
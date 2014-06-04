var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
chai.should();
var nextFlow = lib.nextFlow;
var flow, app, request, response;

before(function(done) {
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

describe('flows/FindId', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.FindId();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('urlパラメータから指定のポストidを取得して、flow.locals.idに保持する。', function(done) {
			request.params.id = 'aaaa';
			var next = function() {
				flow.should.have.property('id', 'aaaa');
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
		it('urlパラメータがない時はflow.locals.idは生成されない。', function(done) {
			request.params.id = '';
			var next = function() {
				flow.should.not.have.property('url');
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
	});
	describe('#Model', function() {
		it('公開指定のポストをflow.locals.idで取得し、flow.locals.urlに保持する。', function(done) {
			flow.id = 'TEST-NOTE-GUID-5';
			var next = function() {
				flow.should.have.property('url', 'TEST-TITLE-5');
				done();
			};
			flow.step('Model', next)(request, response, nextFlow);
		});
		it('ポストが見つからない時は何もしない。', function(done) {
			flow.id = 'aabbcc';
			var next = function() {
				flow.should.not.have.property('url');
				done();
			};
			flow.step('Model', next)(request, response, nextFlow);
		});
		it('flow.locals.urlがない時は何もしない。', function(done) {
			var next = function() {
				flow.should.not.have.property('url');
				done();
			};
			flow.step('Model', next)(request, response, nextFlow);
		});
	});
	describe('#View', function() {
		it('flow.locals.urlが存在する時は/post/[url]にリダイレクトする。', function(done) {
			flow.url = 'aabbcc';
			var check = false;
			response.redirect = function(status, url) {
				expect(status).to.eql(302);
				expect(url).to.eql('/post/aabbcc');
				check = true;
			};
			var next = function() {
				expect(check).to.eql(true);
				done();
			};
			flow.step('View', next)(request, response, nextFlow);
		});
		it('flow.locals.urlが存在しない時はerror404テンプレートを表示する。', function(done) {
			var checkRender = false;
			var checkStatus = false;
			response.render = function(template, params) {
				template.should.eql('error404');
				params.should.not.have.property('post');
				checkRender = true;
			};
			response.status = function(errCode) {
				errCode.should.eql(404);
				checkStatus = true;
			};
			var next = function() {
				expect(checkRender).to.eql(true);
				expect(checkStatus).to.eql(true);
				done();
			};
			flow.step('View', next)(request, response, nextFlow);
		});
	});
});
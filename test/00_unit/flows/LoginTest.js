var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
chai.should();
var nextFlow = lib.nextFlow;
var flow, app, request, response;

describe('flows/Login', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.Login();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('セッションでログイン済みか判定し、ログイン時は/setting/sync/にリダイレクトする。', function(done) {
			request.session.logined = true;
			response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			var next = function() {
				throw new Error('flow.next should not be called.');
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
		it('未ログイン時は特に何もしない。', function(done) {
			response.redirect = function(status, url) {
				throw new Error('response.redirect should not be called.');
			};
			var next = function() {
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
		it('requestの値に関係なくresponse.localsにid、passwordが空で生成される。', function(done) {
			request.body.id = 'abc';
			request.body.password = 'abc';
			var next = function() {
				response.locals.should.have.property('id', '');
				response.locals.should.have.property('password', '');
				done();
			};
			flow.step('Controller', next)(request, response, nextFlow);
		});
	});
	describe('#View', function() {
		it('setting/loginテンプレートを表示する。', function(done) {
			var checkRender = false;
			response.render = function(template, params) {
				template.should.eql('setting/login');
				checkRender = true;
			};
			var next = function() {
				checkRender.should.be.ok;
				done();
			};
			flow.step('View', next)(request, response, nextFlow);
		});
	});
});
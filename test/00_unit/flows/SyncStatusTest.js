var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
chai.should();
var nextFlow = lib.nextFlow;
var flow, app, request, response;

describe('flows/SyncStatus', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.SyncStatus();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('セッションでログイン済みか判定し、未ログイン時は/setting/login/にリダイレクトする。', function(done) {
			request.session.logined = false;
			response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/login/');
				done();
			};
			var next = function() {
				throw new Error('flow.next should not be called.');
			};
			flow.step('Controller', next)(request,response,nextFlow);
		});
		it('セッションにログインフラグが存在しなくても未ログインとして扱う。', function(done) {
			response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/login/');
				done();
			};
			var next = function() {
				throw new Error('flow.next should not be called.');
			};
			flow.step('Controller', next)(request,response,nextFlow);
		});
		it('ログイン時は特に何もしない。', function(done) {
			request.session.logined = true;
			response.redirect = function(status, url) {
				throw new Error('response.redirect should not be called.');
			};
			var next = function () {
				done();
			};
			flow.step('Controller', next)(request,response,nextFlow);
		});
	});
	describe('#Model', function () {
		it('表示するもの、表示するための処理が仕様未確定のためテスト未作成。');
	});
	describe('#View', function() {
		it('setting/syncテンプレートを表示する。', function(done) {
			var checkRender = false;
			response.render = function(template, params) {
				template.should.eql('setting/sync');
				checkRender = true;
			};
			var next = function () {
				checkRender.should.be.ok;
				done();
			};
			flow.step('View', next)(request,response,nextFlow);
		});
	});
});
var flow = require('../../../app/flows/SyncStatus.js');
var stub,Stub = require('../../stub/index.js');

describe('Flows.SyncStatus', function() {
	beforeEach(function() {
		stub = Stub();
	});
	describe('#Controller', function() {
		it('セッションでログイン済みか判定し、未ログイン時は/setting/login/にリダイレクトする。', function(done) {
			stub.request.session.logined = false;
			stub.response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/login/');
				done();
			};
			stub.flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('セッションにログインフラグが存在しなくても未ログインとして扱う。', function(done) {
			stub.response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/login/');
				done();
			};
			stub.flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('ログイン時は特に何もしない。', function(done) {
			stub.request.session.logined = true;
			stub.response.redirect = function(status, url) {
				throw new Error('response.redirect should not be called.');
			};
			stub.flow.next = function () {
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
	});
	describe('#Model', function () {
		it('表示するもの、表示するための処理が仕様未確定のためテスト未作成。');
	});
	describe('#View', function() {
		it('setting/syncテンプレートを表示する。', function(done) {
			var checkRender = false;
			stub.response.render = function(template, params) {
				template.should.eql('setting/sync');
				checkRender = true;
			};
			stub.flow.next = function () {
				checkRender.should.be.ok;
				done();
			};
			flow.View(stub.flow, stub.request, stub.response);
		});
	});
});
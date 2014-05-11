var flow = require('../../../app/flows/DoSyncAll.js');
var stub,Stub = require('../../stub/index.js');

describe('Flows.DoSyncAll', function() {
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
		it('syncコンポーネントのdoSyncAllメソッドを実行する。', function (done) {
			var sync = stub.flow.use('Sync');
			var checkSync = false;
			sync.doSyncAll = function () {
				checkSync = true;
			};
			stub.flow.next = function () {
				checkSync.should.be.ok;
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
	});
	describe('#View', function() {
		it('/setting/sync/にリダイレクトする。', function(done) {
			stub.response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			stub.flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			flow.View(stub.flow, stub.request, stub.response);
		});
	});
});
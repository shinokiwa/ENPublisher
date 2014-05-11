var login = require('../../../app/flows/Login.js');
var stub,Stub = require('../../stub/index.js');

describe('Flows.Login', function() {
	beforeEach(function() {
		stub = Stub();
	});
	describe('#Controller', function() {
		it('セッションでログイン済みか判定し、ログイン時は/setting/sync/にリダイレクトする。', function(done) {
			stub.request.session.logined = true;
			stub.response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			stub.flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			login.Controller(stub.flow, stub.request, stub.response);
		});
		it('未ログイン時は特に何もしない。', function(done) {
			stub.response.redirect = function(status, url) {
				throw new Error('response.redirect should not be called.');
			};
			stub.flow.next = function () {
				done();
			};
			login.Controller(stub.flow, stub.request, stub.response);
		});
		it('requestの値に関係なくresponse.localsにid、passwordが空で生成される。', function(done) {
			stub.request.body.id = 'abc';
			stub.request.body.password = 'abc';
			stub.flow.next = function() {
				stub.response.locals.should.have.property('id', '');
				stub.response.locals.should.have.property('password', '');
				done();
			};
			login.Controller(stub.flow, stub.request, stub.response);
		});
	});
	describe('#View', function() {
		it('setting/loginテンプレートを表示する。', function(done) {
			var checkRender = false;
			stub.response.render = function(template, params) {
				template.should.eql('setting/login');
				checkRender = true;
			};
			stub.flow.next = function () {
				checkRender.should.be.ok;
				done();
			};
			login.View(stub.flow, stub.request, stub.response);
		});
	});
});
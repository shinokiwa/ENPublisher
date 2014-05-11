var flow = require('../../../app/flows/DoLogin.js');
var stub,Stub = require('../../stub/index.js');

describe('Flows.DoLogin', function() {
	beforeEach(function() {
		stub = Stub();
	});
	describe('#Controller', function() {
		it('POST値(request.body)からidとpasswordを取得し、response.locals.id/passwordに保持する。', function (done) {
			stub.request.body.id = 'TestId';
			stub.request.body.password = 'TestPassword';
			stub.flow.next =function (){
				stub.response.locals.should.have.property('id', 'TestId');
				stub.response.locals.should.have.property('password', 'TestPassword');
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('ログイン済みの場合は/setting/sync/にリダイレクトする。', function (done) {
			stub.request.session.logined = true;
			stub.response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			stub.flow.next =function (){
				throw new Error ('flow.next should not be called.');
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
		it('id/passwordがbodyに含まれていなくても、response.locals.id/passwordは空文字で作成される。', function (done) {
			stub.flow.next =function (){
				stub.response.locals.should.have.property('id', '');
				stub.response.locals.should.have.property('password', '');
				done();
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
	});
	describe('#Model', function(done) {
		it('response.locals.id/passwordをExpressコンポーネントが保持しているloginID、loginPasswordと比較して、一致していればrequest.session.loginedをtrueにする。', function (done) {
			stub.response.locals.id = 'TestId';
			stub.response.locals.password = 'TestPassword';
			stub.response.redirect = function(status, url) {
				stub.request.session.should.have.property('logined', true);
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
		it('ログイン成功時は/setting/sync/にリダイレクトする。', function (done) {
			stub.response.locals.id = 'TestId';
			stub.response.locals.password = 'TestPassword';
			stub.response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			stub.flow.next =function (){
				throw new Error ('flow.next should not be called.');
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
		it('IDとパスワードが間違っていた場合はログイン失敗となり、request.session.loginedがfalseになる。', function (done) {
			stub.response.locals.id = 'TestIds';
			stub.response.locals.password = 'TestPasswords';
			stub.flow.next =function (){
				stub.request.session.should.have.property('logined', false);
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
		it('idのみ違っていてもログイン失敗となる。', function (done) {
			stub.response.locals.id = 'TestIds';
			stub.response.locals.password = 'TestPassword';
			stub.flow.next =function (){
				stub.request.session.should.have.property('logined', false);
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
		it('passwordのみ違っていてもログイン失敗となる。', function (done) {
			stub.response.locals.id = 'TestId';
			stub.response.locals.password = 'TestPasswords';
			stub.flow.next =function (){
				stub.request.session.should.have.property('logined', false);
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
		it('IDとパスワード未入力時もrequest.session.loginedがfalseになる。', function (done) {
			stub.response.locals.id = undefined;
			stub.response.locals.password = undefined;
			stub.flow.next =function (){
				stub.request.session.should.have.property('logined', false);
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
		it('ログイン失敗時はresponse.locals.doLoginがtrueになる。', function (done) {
			stub.request.body.id = undefined;
			stub.request.body.password = undefined;
			stub.flow.next =function (){
				stub.response.locals.should.have.property('doLogin', true);
				done();
			};
			flow.Model(stub.flow, stub.request, stub.response);
		});
	});
	describe('#View', function() {
		it('setting/loginテンプレートを表示する。ログイン成功時は処理がここまで来ない想定。', function(done) {
			var checkRender = false;
			stub.response.render = function(template, params) {
				template.should.eql('setting/login');
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
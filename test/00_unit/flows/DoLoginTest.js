var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
chai.should();
var nextFlow = lib.nextFlow;
var flow, app, request, response;

describe('flows/DoLogin', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.DoLogin();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('POST値(request.body)からidとpasswordを取得し、response.locals.id/passwordに保持する。', function (done) {
			request.body.id = 'TestId';
			request.body.password = 'TestPassword';
			var next =function (){
				response.locals.should.have.property('id', 'TestId');
				response.locals.should.have.property('password', 'TestPassword');
				done();
			};
			flow.step('Controller', next)(request,response,nextFlow);
		});
		it('ログイン済みの場合は/setting/sync/にリダイレクトする。', function (done) {
			request.session.logined = true;
			response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			var next =function (){
				throw new Error ('flow.next should not be called.');
			};
			flow.step('Controller', next)(request,response,nextFlow);
		});
		it('id/passwordがbodyに含まれていなくても、response.locals.id/passwordは空文字で作成される。', function (done) {
			var next =function (){
				response.locals.should.have.property('id', '');
				response.locals.should.have.property('password', '');
				done();
			};
			flow.step('Controller', next)(request,response,nextFlow);
		});
	});
	describe('#Model', function(done) {
		it('response.locals.id/passwordをExpressコンポーネントが保持しているloginID、loginPasswordと比較して、一致していればrequest.session.loginedをtrueにする。', function (done) {
			response.locals.id = 'TestId';
			response.locals.password = 'TestPassword';
			response.redirect = function(status, url) {
				request.session.should.have.property('logined', true);
				done();
			};
			flow.step('Model')(request,response,nextFlow);
		});
		it('ログイン成功時は/setting/sync/にリダイレクトする。', function (done) {
			response.locals.id = 'TestId';
			response.locals.password = 'TestPassword';
			response.redirect = function(status, url) {
				status.should.equal(302);
				url.should.equal('/setting/sync/');
				done();
			};
			var next =function (){
				throw new Error ('flow.next should not be called.');
			};
			flow.step('Model', next)(request,response,nextFlow);
		});
		it('IDとパスワードが間違っていた場合はログイン失敗となり、request.session.loginedがfalseになる。', function (done) {
			response.locals.id = 'TestIds';
			response.locals.password = 'TestPasswords';
			var next =function (){
				request.session.should.have.property('logined', false);
				done();
			};
			flow.step('Model', next)(request,response,nextFlow);
		});
		it('idのみ違っていてもログイン失敗となる。', function (done) {
			response.locals.id = 'TestIds';
			response.locals.password = 'TestPassword';
			var next =function (){
				request.session.should.have.property('logined', false);
				done();
			};
			flow.step('Model', next)(request,response,nextFlow);
		});
		it('passwordのみ違っていてもログイン失敗となる。', function (done) {
			response.locals.id = 'TestId';
			response.locals.password = 'TestPasswords';
			var next =function (){
				request.session.should.have.property('logined', false);
				done();
			};
			flow.step('Model', next)(request,response,nextFlow);
		});
		it('IDとパスワード未入力時もrequest.session.loginedがfalseになる。', function (done) {
			response.locals.id = undefined;
			response.locals.password = undefined;
			var next =function (){
				request.session.should.have.property('logined', false);
				done();
			};
			flow.step('Model', next)(request,response,nextFlow);
		});
		it('ログイン失敗時はresponse.locals.doLoginがtrueになる。', function (done) {
			request.body.id = undefined;
			request.body.password = undefined;
			var next =function (){
				response.locals.should.have.property('doLogin', true);
				done();
			};
			flow.step('Model', next)(request,response,nextFlow);
		});
	});
	describe('#View', function() {
		it('setting/loginテンプレートを表示する。ログイン成功時は処理がここまで来ない想定。', function(done) {
			var checkRender = false;
			response.render = function(template, params) {
				template.should.eql('setting/login');
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
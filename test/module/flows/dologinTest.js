var flow = require('../../../app/flows/dologin.js');
require('should');

describe('flows.dologin', function() {
	describe('#controller(response,output,next)', function() {
		it('未ログイン時のみ、POST値からIDとパスワードを取得する。', function(done) {
			var request = {
				session : {
					login : false
				},
				body : {
					ID : 'TestID',
					Password : 'TestPW'
				}
			};
			var input = {};
			flow.controller(request, input, function() {
				input.should.have.property('login', false);
				input.should.have.property('ID', 'TestID');
				input.should.have.property('Password', 'TestPW');
				done();
			});
		});
		it('ログイン済みの場合、POST値は取得しない。', function(done) {
			var request = {
				session : {
					login : true
				},
				body : {
					ID : 'TestID',
					Password : 'TestPW'
				}
			};
			var input = {};
			flow.controller(request, input, function() {
				input.should.have.property('login');
				input.should.not.have.property('ID');
				input.should.not.have.property('Password');
				done();
			});
		});
		it('ID/PWが入力されていない場合でもInputのプロパティは値undefinedで作られる。', function(done) {
			var request = {
				session : {
					login : false
				},
				body : {}
			};
			var input = {};
			flow.controller(request, input, function() {
				input.should.have.property('login', false);
				input.should.have.property('ID');
				input.should.have.property('Password');
				done();
			});
		});
	});
	describe('#model(ID,Password)(Input,Output,next)', function(done) {
		var component = function(session, ID, Password) {
			return {
				session: function () {
					return session;
				},
				login: function () {
					return {
						ID : ID,
						Password : Password
					};
				}
			};
		};
		it('未ログイン時のみ、IDとパスワードを与えられた値と比較し、セッションとOutputに結果を代入する。', function(done) {
			var session = {};
			var input = {
				login : false,
				ID : 'TestID',
				Password : 'TestPassword',
				components: component(session, 'TestID', 'TestPassword')
			};
			var output = {};
			flow.model(input, output, function() {
				session.should.have.property('login', true);
				output.should.have.property('login', true);
				output.should.have.property('dologin', true);
				done();
			});
		});
		it('IDとパスワードが間違っていた場合はログイン失敗となる。', function(done) {
			var session = {};
			var input = {
				login : false,
				ID : 'FailID',
				Password : 'FailPassword',
				components: component(session, 'TestID', 'TestPassword')
			};
			var output = {};
			flow.model(input, output, function() {
				session.should.have.property('login', false);
				output.should.have.property('login', false);
				output.should.have.property('dologin', true);
				output.should.have.property("ID", 'FailID');
				output.should.have.property('Password', 'FailPassword');
				done();
			});
		});
		it('ログイン済みの場合はOutputにログインOKを追加するのみ。', function(done) {
			var session = {};
			var input = {
				login : true,
				ID : 'FailID',
				Password : 'FailPassowrd',
				components: component(session, 'TestID', 'TestPassword')
			};
			var output = {};
			flow.model(input, output, function() {
				session.should.not.have.property('login');
				output.should.have.property('login', true);
				output.should.have.property('dologin', false);
				done();
			});
		});
	});
});
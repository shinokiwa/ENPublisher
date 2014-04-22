var login = require('../../app/flows/login.js');
require('should');

describe('flows.login', function() {
	describe('#v(response,output,next)', function (){
		it('未ログイン時のみ、setting/loginテンプレートを表示する。', function (done) {
			login.v({
				render: function (template, params) {
					template.should.equal('setting/login');
					done();
				}
			}, {
				login: false
			}, function(){});
		});
		it('ログイン時は/setting/sync/にリダイレクトする。', function(done) {
			login.v({
				redirect: function (status, url) {
					status.should.equal(302);
					url.should.equal('/setting/sync/');
					done();
				}
			}, {
				login: true
			}, function(){});
		});
	});
});
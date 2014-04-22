var view = require('../../app/flows/common.js').view;
require('should');

describe('common.view', function() {
	describe('#tempalte(template)', function() {
		it('指定したテンプレートを出力する関数を返す。', function(done) {
			view.template('index')({
				render: function (template, params) {
					params.testValue.should.equal('View!');
					template.should.equal('index');
					done();
				}
			},{
				testValue: 'View!'
			});
		});
	});
	describe('#redirect(status, url)', function() {
		it('指定したステータスでリダイレクトする関数を返す。', function(done) {
			view.redirect('301', '/')({
				redirect: function (status, url) {
					status.should.equal('301');
					url.should.equal('/');
					done();
				}
			},{
				testValue: 'View!'
			});
		});
		it('302リダイレクトも指定する必要がある。', function(done) {
			view.redirect('302', '/Setting/Login')({
				redirect: function (status, url) {
					status.should.equal('302');
					url.should.equal('/Setting/Login');
					done();
				}
			},{
				testValue: 'View!'
			});
		});
	});

	describe('#error', function() {
		it('Call response.render() and response.status()', function(done) {
			var checkStatus = false;
			view.error('404')({
				status: function (code) {
					code.should.equal('404');
					checkStatus = true;
				},
				render: function (template, params) {
					params.testValue.should.equal('View!');
					template.should.equal('error404');
					checkStatus.should.equal(true);
					done();
				}
			},{
				testValue: 'View!'
			});
		});
	});
	
	describe('#requireAuth(template)', function () {
		it('ログイン時のみ、指定したテンプレートを表示する。', function (done) {
			view.requireAuth('index')({
				render: function (template, params) {
					template.should.equal('index');
					done();
				}
			}, {
				login: true
			}, function(){});
		});
		it('未ログイン時は/setting/login/にリダイレクトする。', function(done) {
			view.requireAuth('index')({
				redirect: function (status, url) {
					status.should.equal(302);
					url.should.equal('/setting/login/');
					done();
				}
			}, {
				login: false
			}, function(){});
		});
		it('viewパラメータにloginが指定されていなくてもリダイレクトする。', function(done) {
			view.requireAuth('index')({
				redirect: function (status, url) {
					status.should.equal(302);
					url.should.equal('/setting/login/');
					done();
				}
			}, {
			}, function(){});
		});
	});
});

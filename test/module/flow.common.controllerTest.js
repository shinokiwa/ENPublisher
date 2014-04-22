var c = require('../../app/flows/common.js').controller;
require('should');

describe('common.controller', function() {
	describe('#requireAuth()', function () {
		it('セッション上のログインの有無を引き渡す。', function (done) {
			var input = {};
			c.requireAuth({
				session: {
					login: true
				}
			}, input, function(){
				input.should.have.property('login');
				input.login.should.equal(true);
				done();
			});
		});
		it('セッションにfalseが入っている場合はログインなしとなる。', function (done) {
			var input = {};
			c.requireAuth({
				session: {
					login: false
				}
			}, input, function(){
				input.should.have.property('login');
				input.login.should.equal(false);
				done();
			});
		});
		it('ログイン情報がない場合は未ログインとして引き渡す。', function (done) {
			var input = {};
			c.requireAuth({
				session: {}
			}, input, function(){
				input.should.have.property('login');
				input.login.should.equal(false);
				done();
			});
		});
	});
});

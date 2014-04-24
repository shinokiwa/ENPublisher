var m = require('../../../app/flows/common.js').model;
require('should');

describe('common.model', function() {
	describe('#requireAuth(input, output, next)', function () {
		it('単純にinputのログイン情報をoutputに引き渡す。', function (done) {
			var output = {};
			m.requireAuth({
				login: true
			}, output, function(){
				output.should.have.property('login');
				output.login.should.equal(true);
				done();
			});
		});
		it('ログイン情報がfalseの場合はfalseとなる。', function (done) {
			var output = {};
			m.requireAuth({
				login: false
			}, output, function(){
				output.should.have.property('login');
				output.login.should.equal(false);
				done();
			});
		});
	});
});

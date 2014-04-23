var express = require ('../../app/express.js');
var App = require ('../../app/app.js');
require('should');

describe('Express', function() {
	it('Expressの設定を行うのみなので、エラー発生の有無のみ確認。', function (done) {
		express(new App());
		done();
	});
});
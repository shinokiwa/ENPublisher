var Configure = require('../../app/configure.js');
require('should');

describe('Configure', function() {
	var defaultPath = __dirname + '/testconfigure.json';
	describe('#constructor(filePath)', function () {
		it('指定したパスのjsonファイルを読み込み、自分自身のプロパティとして持つ。', function () {
			var configure = new Configure (defaultPath);
			configure.values.should.have.property('Test');
			configure.values.Test.should.equal('TestValue!');
		});
		it('指定パスにjsonファイルがない場合、何も読み込まない。', function () {
			var configure = new Configure (__dirname+'/aaa');
			configure.values.should.be.empty;
		});
	});
	describe('#get(key)', function () {
		var configure = new Configure (defaultPath);
		it('指定したキーの設定値を返す。', function () {
			configure.get('Test').should.eql('TestValue!');
		});
		it('存在しないキーの場合はundefinedになる。', function () {
			(typeof configure.get('Undef')).should.eql('undefined');
		});
	});
	describe('#reload()', function () {
		it('コンストラクタで指定したパスのファイルを再読み込みする。');
		// write実装するまで保留
	});
});
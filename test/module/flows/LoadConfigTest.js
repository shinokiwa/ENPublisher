var Configure = require('../../../app/flows/LoadConfig.js');
var Stub = require ('../../stub/index.js');
var stub;

describe('Flows.LoadConfig', function() {
	var defaultPath = __dirname + '/../testconfigure.json';
	describe('#Controller()', function () {
		beforeEach (function () {
			stub = Stub();
		});
		it('指定したパスのjsonファイルを読み込み、flow.locals.configureに代入する。値は別のモジュールが任意に読み込める。', function (done) {
			var configure = Configure (defaultPath);
			stub.flow.next = function () {
				stub.flow.locals.should.have.property('configure');
				stub.flow.locals.configure.should.have.property('Test', 'TestValue!');
				done();
			};
			configure.Controller (stub.flow);
		});
		it('指定パスにjsonファイルがない場合、何も読み込まない。', function () {
			var configure = Configure (__dirname+'/aaa');
			stub.flow.next = function () {
				stub.flow.locals.should.have.property('configure');
				stub.flow.locals.configure.should.be.empty;
			};
			configure.Controller (stub.flow);
		});
	});
});
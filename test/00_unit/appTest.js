var lib = require('./testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var App = lib.require('app.js');
var FlowClass = lib.require('app/FlowClass.js');

describe('App', function() {
	it('Appクラスのインスタンスを生成する。', function() {
		var app = new App();
		expect(app).to.be.a('object');
	});
	it('コンストラクタには設定ファイル(json)のパスを引数として渡す。値は_configureに保持される。', function() {
		var app = new App(__dirname+'/testconfigure.json');
		expect(app).to.have.property('_configure', __dirname+'/testconfigure.json');
	});
	describe('#add(name, object)', function() {
		it('フロークラスを生成する。', function() {
			var app = new App();
			expect(app.add('Index', {})).to.be.a('function');
		});
		it('フロークラスはflows[name]に保持される。', function() {
			var app = new App();
			app.add('Index', {});
			expect(app.flows.Index).to.be.a('function');
			app.add('Post', {});
			expect(app.flows.Post).to.be.a('function');
		});
		it('フロークラスは引数に渡されたオブジェクトで生成される。', function() {
			var app = new App();
			app.add('Index', {
				Test : 'abc!'
			});
			var flow = new app.flows.Index();
			expect(flow).to.have.property('Test', 'abc!');
		});
		it('フロークラスには自分自身も渡す。', function() {
			var app = new App();
			app.add('Index', {
				Test : 'abc!'
			});
			expect(app.flows.Index.prototype.app).to.eql(app);
		});
	});
	describe('#flow(name, callback)', function() {
		it('フロークラスのインスタンスを生成し、flow()にコールバックを渡した戻り値を返す。', function() {
			var app = new App();
			app.add('Index', {
				Test : 'abc!'
			});
			var flow = app.flow('Index', function() {
			});
			expect(flow).to.be.a('function');
		});
		it('戻り値はFlowClass::flow()の戻り値同様そのまま実行可能で、完了後渡したコールバックが実行される。', function(done) {
			var app = new App();
			var check = false;
			app.add('Index', {
				Controller : function(arg, next) {
					expect(arg).to.eql('test');
					check = true;
					next();
				}
			});
			var flow = app.flow('Index', function() {
				expect(check).to.eql(true);
				done();
			});
			flow('test');
		});
		it('コールバックは省略可能。', function() {
			var app = new App();
			var check = false;
			app.add('Index', {
				Controller : function(arg, next) {
					expect(arg).to.eql('test');
					check = true;
					next();
				}
			});
			app.flow('Index')('test');
			expect(check).to.eql(true);
		});
		it('存在しないフロークラスを指定した場合は何もせずコールバックを実行する。', function(done) {
			var app = new App();
			var flow = app.flow('Index', function() {
				done();
			})();
		});
		it('存在しないフロークラスを指定し、コールバックも渡さなかった場合は何もしない関数を返す。', function() {
			var app = new App();
			var flow = app.flow('Index')();
		});
	});
	describe('#set(name, component)', function() {
		it('コンポーネントを指定した名称で保持する。', function() {
			var app = new App();
			app.set('Database', function() {
				return 'Test!';
			});
		});
		it('セットしたコンポーネントはcomponentsに保持する。', function() {
			var app = new App();
			var com = function() {
				return 'Test!';
			};
			app.set('Database', com);
			expect(app.components).to.have.property('Database', com);
		});
	});
	describe('#configure(listener)', function() {
		it('Configureフローに指定したリスナをバインドする。Configureフローが存在しない場合は作成する。', function () {
			var app = new App(__dirname+'/configure.json');
			expect(app.flows).to.not.have.property('Configure');
			app.configure(function (configure, next) {
				next();
			});
			expect(app.flows).to.have.property('Configure');
		});
		it('ConfigureフローはLoad、Configure、Readyのステップを持つ。', function () {
			var app = new App(__dirname+'/configure.json');
			app.configure(function (configure, next) {
				next();
			});
			expect(app.flows.Configure.prototype.steps).to.eql(['Load', 'Configure', 'Ready']);
		});
		it('バインドされる先はConfigureステップになる。初期のメソッドは何もない。', function () {
			var app = new App(__dirname+'/configure.json');
			app.configure(function (configure, next) {
				next();
			});
			expect(app.flows.Configure.prototype.Configure).to.length(1);
			app.configure(function (configure, next) {
				next();
			});
			expect(app.flows.Configure.prototype.Configure).to.length(2);
		});
		it('Loadステップを実行するとappのreadyStateが0になる。', function () {
			var app = new App(__dirname+'/configure.json');
			app.readyState = 1;
			app.configure(function (configure, next) {
				next();
			});
			var flow = new app.flows.Configure();
			flow.Load({}, function () {
				expect(app.readyState).to.eql(0);
			});
		});
		it('Readyステップを実行するとappのreadyStateが1になる。', function () {
			var app = new App(__dirname+'/configure.json');
			app.readyState = 0;
			app.configure(function (configure, next) {
				next();
			});
			var flow = new app.flows.Configure();
			flow.Ready({}, function () {
				expect(app.readyState).to.eql(1);
			});
		});
	});
	describe('#ready(listener)', function() {
		it('Readyフローにリスナをバインドする。Readyフローが存在しない場合は作成する。', function () {
			var app = new App(__dirname+'/configure.json');
			expect(app.flows).to.not.have.property('Ready');
			app.ready(function (next) {
				next();
			});
			expect(app.flows).to.have.property('Ready');
		});
		it('ReadyフローはReadyステップのみを持つ。バインド先もReadyステップになる。', function () {
			var app = new App(__dirname+'/configure.json');
			app.ready(function (ready, next) {
				next();
			});
			expect(app.flows.Ready.prototype.steps).to.eql(['Ready']);
			expect(app.flows.Ready.prototype.Ready).to.length(1);
			app.ready(function (configure, next) {
				next();
			});
			expect(app.flows.Ready.prototype.Ready).to.length(2);
		});
		it('readyStateが1の時はリスナをバインドしつつ実行する。', function () {
			var app = new App(__dirname+'/configure.json');
			app.readyState = 1;
			var check = false;
			app.ready(function (next) {
				check = true;
				next();
			});
			expect(check).to.eql(true);
		});
		it('readyStateが0の時はバインドのみで実行しない。', function () {
			var app = new App(__dirname+'/configure.json');
			app.readyState = 0;
			var check = false;
			app.ready(function (next) {
				check = true;
				next();
			});
			expect(check).to.eql(false);
		});
	});
	describe('#process()', function() {
		it('Configureフローを実行し、終了後にReadyフローを実行する。', function (done) {
			var app = new App(__dirname+'/unittest.configure.json');
			var check1 = false, check2 = false;
			app.configure(function (configure, next) {
				expect(check2).to.eql(false);
				check1 = true;
				next();
			});
			app.ready(function (next) {
				expect(check1).to.eql(true);
				check2 = true;
				next();
				done();
			});
			app.process();
		});
		it('Configureフローがない時は即座にReadyフローを実行する。その際はreadyStateを1にする。', function (done) {
			var app = new App(__dirname+'/unittest.configure.json');
			expect(app.flows).to.not.have.property('Configure');
			app.ready(function (next) {
				expect(app.readyState).eql(1);
				next();
				done();
			});
			app.process();
		});
		it('Configureフローがある時はコンストラクタに渡されたパスでjsonファイルを読み込み、Configureフローに引数として渡す。', function (done) {
			var app = new App(__dirname+'/unittest.configure.json');
			var check1 = false, check2 = false;
			app.configure(function (configure, next) {
				expect(configure).to.have.property('evernote');
				expect(configure.evernote).to.have.property('token', 'TEST-TOKEN');
				expect(check2).to.eql(false);
				check1 = true;
				next();
			});
			app.ready(function (next) {
				expect(check1).to.eql(true);
				check2 = true;
				next();
				done();
			});
			app.process();
		});
		it('コンストラクタに渡されたパスにファイルがない場合、例外をスルーする。', function () {
			var app = new App(__dirname+'/unittest.configure2.json');
			app.configure(function (configure, next) {
				next();
			});
			expect(app.process).to.throw(Error);
		});
	});
});
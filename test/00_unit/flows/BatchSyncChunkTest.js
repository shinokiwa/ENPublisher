var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var sinon = lib.sinon;
var App = lib.require('app.js');
var test, sync, app;

describe('flows/BatchSyncChunk', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			test = new app.flows.BatchSyncChunk();
			sync = test.use('Sync');
			done();
		});
		app.process();
	});
	afterEach(function() {
		if (test.lock) {
			sync.unlock(test.lock);
		}
	});
	describe('#Controller', function() {
		it('Syncコンポーネントからロックを取得して、this.lockにキーを保持する。', function(done) {
			var next = function() {
				expect(sync.lock('Test')).to.eql(0);
				expect(test).to.have.property('lock');
				expect(test.lock).to.not.eql(undefined);
				expect(test.lock).to.not.eql(null);
				expect(test.lock).to.not.eql(0);
				done();
			};
			test.step('Controller',next)();
		});
		it('ロック取得に失敗した場合はエラーBatchSyncChunkを残して終了。', function(done) {
			var unlock = sync.lock('Test');
			expect(unlock).to.not.eql(0);
			var next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				expect(error).to.have.property('key', 'BatchSyncChunk');
				expect(error).to.have.property('body');
				sync.unlock(unlock);
				done();
			}, 5);
			test.step('Controller',next)();
		});
	});

	describe('#Model', function(done) {
		it('SyncコンポーネントのUSNとEvernoteのUSNを比較して、Evernote側が大きい時に差分を同期する。最大100件。', function(done) {
			sync.USN = 12;
			var next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(100);
				expect(list[0]).to.have.property('key', 'TEST-NOTE-GUID-0');
				expect(list[0]).to.have.property('body', 'TEST-TITLE-0');
				done();
			};
			test.step('Model',next)();
		});
		it('USNが同値の時は同期しない。なお、比較するUSNはchunkHighUSNになる。', function(done) {
			sync.USN = 10000;
			var next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(0);
				done();
			};
			test.step('Model',next)();
		});
		it('SyncコンポーネントのUSNの方が大きい時は、同期せずUSNをEvernote側に一致させる。', function(done) {
			sync.USN = 50000;
			var next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(0);
				expect(sync.USN).to.eql(10000);
				done();
			};
			test.step('Model',next)();
		});
		it('SyncコンポーネントのUSNがnullの時は同期せず、USNをEvernote側に一致させる。', function(done) {
			sync.USN = null;
			var next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(0);
				expect(sync.USN).to.eql(10000);
				done();
			};
			test.step('Model',next)();
		});
		it('リスト同期完了後はSyncコンポーネントのUSN、lastSyncを更新する。', function(done) {
			sync.USN = 56;
			var next = function() {
				expect(sync.USN).to.eql(10000);
				expect(sync.lastSyncAll).to.eql(null);
				expect(sync.lastSync).to.be.instanceOf(Date);
				done();
			};
			test.step('Model',next)();
		});
		it('同期しなかった場合、lastSyncは更新しない。', function(done) {
			sync.USN = null;
			var next = function() {
				expect(sync.USN).to.eql(10000);
				expect(sync.lastSync).to.eql(null);
				done();
			};
			test.step('Model',next)();
		});
	});
	describe('#View', function() {
		it('Syncをflow.locals.lockを使ってアンロックする。', function(done) {
			test.lock = sync.lock('Test-lock');
			var next = function() {
				expect(sync.lock('test')).to.not.eql(0);
				done();
			};
			test.step('View',next)();
		});
		it('Syncのdurationを1分に設定する。', function(done) {
			test.lock = sync.lock('Test-lock');
			expect(sync._duration).to.not.eql(60);
			var next = function() {
				expect(sync._duration).to.eql(60);
				done();
			};
			test.step('View',next)();
		});
	});
});
var chai = require('chai');
var should = chai.should(), expect = chai.expect;

var setup = require('../setup.js');
var suite,flow, test;

var data = require ('../data/evernote.js');

describe('flows/BatchSyncChunk', function() {
	beforeEach(function(done) {
		suite = setup(function () {
			done();
		});
		flow = suite.flow;
		test = suite.require('flows/BatchSyncChunk.js');
	});
	describe('#Controller', function() {
		it('Syncコンポーネントからロックを取得して、flow.locals.lockにキーを保持する。', function(done) {
			flow.next = function() {
				var sync = flow.use('Sync');
				sync.lock('Test').should.eql(0);
				expect(flow.locals).to.have.property('lock');
				expect(flow.locals.lock).to.not.eql(undefined);
				expect(flow.locals.lock).to.not.eql(null);
				expect(flow.locals.lock).to.not.eql(0);
				done();
			};
			test.Controller(flow);
		});
		it('ロック取得に失敗した場合はエラーBatchSyncChunkを残して終了。', function(done) {
			var sync = flow.use('Sync');
			sync.lock('Test').should.not.eql(0);
			flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				error.should.have.property('key', 'BatchSyncChunk');
				error.should.have.property('body');
				done();
			}, 5);
			test.Controller(flow);
		});
	});

	describe('#Model', function(done) {
		it('SyncコンポーネントのUSNとEvernoteのUSNを比較して、Evernote側が大きい時に差分を同期する。最大100件。', function(done) {
			var sync = flow.use('Sync');
			sync.USN = 12;
			flow.next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(100);
				expect(list[0]).to.have.property('key', 'TEST-NOTE-GUID-0');
				expect(list[0]).to.have.property('body', 'TEST-TITLE-0');
				done();
			};
			test.Model(flow);
		});
		it('USNが同値の時は同期しない。なお、比較するUSNはchunkHighUSNになる。', function (done) {
			var sync = flow.use('Sync');
			sync.USN = 10000;
			flow.next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(0);
				done();
			};
			test.Model(flow);
		});
		it('SyncコンポーネントのUSNの方が大きい時は、同期せずUSNをEvernote側に一致させる。', function (done) {
			var sync = flow.use('Sync');
			sync.USN = 50000;
			flow.next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(0);
				expect(sync.USN).to.eql(10000);
				done();
			};
			test.Model(flow);
		});
		it('SyncコンポーネントのUSNがnullの時は同期せず、USNをEvernote側に一致させる。', function (done) {
			var sync = flow.use('Sync');
			sync.USN = null;
			flow.next = function() {
				var list = sync.noteList.all();
				expect(list).to.length(0);
				expect(sync.USN).to.eql(10000);
				done();
			};
			test.Model(flow);
		});
		it('リスト同期完了後はSyncコンポーネントのUSN、lastSyncを更新する。', function(done) {
			var sync = flow.use('Sync');
			sync.USN = 56;
			flow.next = function() {
				sync.USN.should.eql(10000);
				expect(sync.lastSyncAll).to.eql(null);
				expect(sync.lastSync).to.be.instanceOf(Date);
				done();
			};
			test.Model(flow);
		});
		it('同期しなかった場合、lastSyncは更新しない。', function(done) {
			var sync = flow.use('Sync');
			sync.USN = null;
			flow.next = function() {
				sync.USN.should.eql(10000);
				expect(sync.lastSync).to.eql(null);
				done();
			};
			test.Model(flow);
		});
	});
	describe('#View', function() {
		it('Syncをflow.locals.lockを使ってアンロックする。', function(done) {
			var sync = flow.use('Sync');
			flow.locals.lock = sync.lock('Test-lock');
			flow.next = function() {
				expect(sync.lock('test')).to.not.eql(0);
				done();
			};
			test.View(flow);
		});
		it('Syncのdurationを1分に設定する。', function(done) {
			var sync = flow.use('Sync');
			flow.locals.lock = sync.lock('Test-lock');
			expect(sync._duration).to.not.eql(60);
			flow.next = function() {
				expect(sync._duration).to.eql(60);
				done();
			};
			test.View(flow);
		});
	});
});
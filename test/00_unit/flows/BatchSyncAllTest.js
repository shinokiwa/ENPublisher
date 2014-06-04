var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var sinon = lib.sinon;
var App = lib.require('app.js');
var data = require ('../data/evernote.js');
var test, sync, app;

before(function (done) {
	app = lib.create(__dirname + '/../unittest.configure.json');
	app.ready(function(next) {
		test = new app.flows.BatchSyncAll();
		lib.databaseInit(test, function() {
			next();
			done();
		});
	});
	app.process();
});

describe('Flows/BatchSyncAll', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			test = new app.flows.BatchSyncAll();
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
			test.step('Controller', next)();
		});
		it('取得時にthis.offsetに0を設定する。', function(done) {
			var next = function() {
				expect(test.offset).to.eql(0);
				done();
			};
			test.step('Controller', next)();
		});
		it('ロック取得に失敗した場合はエラーBatchSyncAllを残して終了。', function(done) {
			var unlock = sync.lock('Test');
			expect(unlock).to.not.eql(0);
			var next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				expect(error).to.have.property('key', 'BatchSyncAll');
				expect(error).to.have.property('body');
				sync.unlock(unlock);
				done();
			}, 5);
			test.step('Controller', next)();
		});
	});
	describe('#Model', function() {
		describe('#Evernote', function() {
			beforeEach(function() {
				test.offset = 0;
			});
			it('EvernoteコンポーネントのgetMetaAllメソッドを呼び出し、ノートリストをSyncのリストに入れる。', function(done) {
				data.nextDataLength(1);
				var next = function() {
					var list = sync.noteList.all();
					expect(list[0]).to.have.property('key', 'TEST-NOTE-GUID-0');
					expect(list[0]).to.have.property('body', 'TEST-TITLE-0');
					done();
				};
				test.Model.Evernote.apply(test, [next]);
			});
			it('ノートが空の場合は何もしない。', function(done) {
				data.nextDataLength(0);
				var next = function() {
					expect(sync.noteList.count()).to.eql(0);
					done();
				};
				test.Model.Evernote.apply(test, [next]);
			});
			it('一度の取得で完了しない数のノートがある場合、自分自身を再度実行する。全てのノートを取得するまで繰り返す。', function(done) {
				var next = function() {
					var list = sync.noteList.all();
					expect(list).to.length(303);
					done();
				};
				test.Model.Evernote.apply(test, [next]);
			});
			it('リスト同期完了後はSyncコンポーネントのUSN、lastSyncAll、lastSyncを更新する。', function(done) {
				expect(sync.USN).to.eql(null);
				expect(sync.lastSyncAll).to.eql(null);
				expect(sync.lastSync).to.eql(null);
				var next = function() {
					expect(sync.USN).to.eql(46);
					expect(sync.lastSyncAll).to.be.instanceOf(Date);
					expect(sync.lastSync).to.be.instanceOf(Date);
					done();
				};
				test.Model.Evernote.apply(test, [next]);
			});
			it('Evernoteからエラーを返された場合、Syncのエラーリストに追加し、フロー自体は継続する。', function(done) {
				data.nextError ({
					errorCode: 2,
					parameter: 'Note.guid'
				});
				var next = function() {
					var err = sync.errorList.get();
					expect(err).to.have.property('key', 'BatchSyncAll');
					expect(err).to.have.property('body', '{"errorCode":2,"parameter":"Note.guid"}');
					done();
				};
				test.Model.Evernote.apply(test, [next]);
			});
			it('リスト同期中にEvernote側のUSNが更新された場合、キューを破棄して最初からやり直す(未実装)。');
		});
		describe('#Database', function() {
			it('データベースから全てのポストを取得して、guidとタイトルをSyncのノートリストに追加する。', function (done) {
				var next = function() {
					var list = sync.noteList.all();
					expect(list).to.length(32);
					expect(list[0]).to.have.property('key');
					expect(list[0]).to.have.property('body');
					done();
				};
				test.Model.Database.apply(test, [next]);
			});
		});
	});
	describe('#View', function() {
		it('Syncをthis.lockを使ってアンロックする。', function(done) {
			test.lock = sync.lock('Test-lock');
			var next = function() {
				expect(sync.lock('test')).to.not.eql(0);
				done();
			};
			test.step('View', next)();
		});
		it('Syncのdurationを15分に設定する。', function(done) {
			test.lock = sync.lock('Test-lock');
			expect(sync._duration).to.not.eql(15*60);
			var next = function() {
				expect(sync._duration).to.eql(15*60);
				done();
			};
			test.step('View', next)();
		});
	});
});
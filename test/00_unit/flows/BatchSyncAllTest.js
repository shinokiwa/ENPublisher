var chai = require('chai');
var should = chai.should(), expect = chai.expect;

var setup = require('../setup.js');
var suite,flow,mod;

var data = require ('../data/evernote.js');
var db = require ('../data/db.js');

describe('Flows/BatchSyncAll', function() {
	beforeEach(function(done) {
		suite = setup(function () {
			db.init(function () {
				done();
			});
		});
		flow = suite.flow;
		mod = suite.require('flows/BatchSyncAll.js');
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
			mod.Controller(flow);
		});
		it('取得時にflow.locals.offsetに0を設定する。', function(done) {
			flow.next = function() {
				flow.locals.offset.should.eql(0);
				done();
			};
			mod.Controller(flow);
		});
		it('ロック取得に失敗した場合はエラーBatchSyncAllを残して終了。', function(done) {
			var sync = flow.use('Sync');
			sync.lock('Test').should.not.eql(0);
			flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				error.should.have.property('key', 'BatchSyncAll');
				error.should.have.property('body');
				done();
			}, 5);
			mod.Controller(flow);
		});
	});
	describe('#Model', function() {
		describe('#Evernote', function() {
			beforeEach(function() {
				flow.locals.offset = 0;
			});
			it('EvernoteコンポーネントのgetMetaAllメソッドを呼び出し、ノートリストをSyncのリストに入れる。', function(done) {
				data.nextDataLength(1);
				flow.next = function() {
					var sync = flow.use('Sync');
					var list = sync.noteList.all();
					list[0].should.have.property('key', 'TEST-NOTE-GUID-0');
					list[0].should.have.property('body', 'TEST-TITLE-0');
					done();
				};
				mod.Model.Evernote(flow);
			});
			it('ノートが空の場合は何もしない。', function(done) {
				data.nextDataLength(0);
				flow.next = function() {
					var sync = flow.use('Sync');
					expect(sync.noteList.count()).to.eql(0);
					done();
				};
				mod.Model.Evernote(flow);
			});
			it('一度の取得で完了しない数のノートがある場合、自分自身を再度実行する。全てのノートを取得するまで繰り返す。', function(done) {
				flow.next = function() {
					var sync = flow.use('Sync');
					var list = sync.noteList.all();
					list.should.length(303);
					done();
				};
				mod.Model.Evernote(flow);
			});
			it('リスト同期完了後はSyncコンポーネントのUSN、lastSyncAll、lastSyncを更新する。', function(done) {
				var sync = flow.use('Sync');
				(sync.USN === null).should.eql(true);
				(sync.lastSyncAll === null).should.eql(true);
				(sync.lastSync === null).should.eql(true);
				flow.next = function() {
					sync.USN.should.eql(46);
					sync.lastSyncAll.should.be.instanceOf(Date);
					sync.lastSync.should.be.instanceOf(Date);
					done();
				};
				mod.Model.Evernote(flow);
			});
			it('Evernoteからエラーを返された場合、Syncのエラーリストに追加し、フロー自体は継続する。', function(done) {
				data.nextError ({
					errorCode: 2,
					parameter: 'Note.guid'
				});
				flow.next = function() {
					var sync = flow.use('Sync');
					var err = sync.errorList.get();
					err.should.have.property('key', 'BatchSyncAll');
					err.should.have.property('body', '{"errorCode":2,"parameter":"Note.guid"}');
					done();
				};
				mod.Model.Evernote(flow);
			});
			it('リスト同期中にEvernote側のUSNが更新された場合、キューを破棄して最初からやり直す(未実装)。');
		});
		describe('#Database', function() {
			it('データベースから全てのポストを取得して、guidとタイトルをSyncのノートリストに追加する。', function (done) {
				flow.next = function() {
					var sync = flow.use('Sync');
					var list = sync.noteList.all();
					list.should.length(1);
					list[0].should.have.property('key', 'TEST-DB-NOTE-GUID-1');
					list[0].should.have.property('body', 'TEST-DB-TITLE-1');
					done();
				};
				mod.Model.Database(flow);
			});
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
			mod.View(flow);
		});
		it('Syncのdurationを15分に設定する。', function(done) {
			var sync = flow.use('Sync');
			flow.locals.lock = sync.lock('Test-lock');
			expect(sync._duration).to.not.eql(15*60);
			flow.next = function() {
				expect(sync._duration).to.eql(15*60);
				done();
			};
			mod.View(flow);
		});
	});
});
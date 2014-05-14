var flow = require('../../../app/flows/BatchSyncAll.js');
var stub, Stub = require('../../stub/index.js');

describe('Flows.BatchSyncAll', function() {
	beforeEach(function() {
		stub = Stub();
	});

	describe('#Controller', function() {
		it('Syncコンポーネントからロックを取得する。', function(done) {
			stub.flow.next = function() {
				var sync = stub.flow.use('Sync');
				sync.lock('Test').should.eql(false);
				done();
			};
			flow.Controller(stub.flow);
		});
		it('取得時にflow.locals.offsetに0を設定する。。', function(done) {
			stub.flow.next = function() {
				stub.flow.locals.offset.should.eql(0);
				done();
			};
			flow.Controller(stub.flow);
		});
		it('ロック取得に失敗した場合はエラーBatchSyncAllを残して終了。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.lock('Test').should.eql(true);
			stub.flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				error.should.have.property('key', 'BatchSyncAll');
				error.should.have.property('body');
				done();
			}, 5);
			flow.Controller(stub.flow);
		});
	});
	describe('#Model', function() {
		describe('#Evernote', function() {
			beforeEach(function() {
				stub.flow.locals.offset = 0;
			});
			it('EvernoteコンポーネントのgetMetaAllメソッドを呼び出し、ノートリストをSyncのリストに入れる。', function(done) {
				stub.flow.next = function() {
					var sync = stub.flow.use('Sync');
					var list = sync.noteList.all();
					list.should.length(1);
					list[0].should.have.property('key', 'test-guid-1');
					list[0].should.have.property('body', 'Test Title 1');
					done();
				};
				flow.Model.Evernote(stub.flow);
			});
			it('一度の取得で完了しない数のノートがある場合、自分自身を再度実行する。全てのノートを取得するまで繰り返す。', function(done) {
				var evernote = stub.flow.use('Evernote');
				evernote.setNotesCount(1000);
				stub.flow.next = function() {
					var sync = stub.flow.use('Sync');
					var list = sync.noteList.all();
					list.should.length(1000);
					list[0].should.have.property('key', 'test-guid-0');
					list[0].should.have.property('body', 'Test Title 0');
					list[999].should.have.property('key', 'test-guid-999');
					list[999].should.have.property('body', 'Test Title 999');
					done();
				};
				flow.Model.Evernote(stub.flow);
			});
			it('リスト同期完了後はSyncコンポーネントのUSN、lastSyncAll、lastSyncを更新する。', function(done) {
				var sync = stub.flow.use('Sync');
				(sync.USN === null).should.eql(true);
				(sync.lastSyncAll === null).should.eql(true);
				(sync.lastSync === null).should.eql(true);
				stub.flow.next = function() {
					sync.USN.should.eql(46);
					sync.lastSyncAll.should.be.instanceOf(Date);
					sync.lastSync.should.be.instanceOf(Date);
					done();
				};
				flow.Model.Evernote(stub.flow);
			});
			it('Evernoteからエラーを返された場合、Syncのエラーリストに追加し、フロー自体は継続する。', function(done) {
				var evernote = stub.flow.use('Evernote');
				evernote.once('getMetaAll', function(input, output) {
					output.err = {
						errorCode : 2,
						parameter : 'Note.guid'
					};
					output.data = undefined;
				});
				stub.flow.next = function() {
					var sync = stub.flow.use('Sync');
					var err = sync.errorList.get();
					err.should.have.property('key', 'BatchSyncAll');
					err.should.have.property('body', '{"errorCode":2,"parameter":"Note.guid"}');
					done();
				};
				flow.Model.Evernote(stub.flow);
			});
			it('リスト同期中にEvernote側のUSNが更新された場合、キューを破棄して最初からやり直す(未実装)。');
		});
		describe('#Database', function() {
			it('データベースから全てのポストを取得して、guidとタイトルをSyncのノートリストに追加する。', function (done) {
				var db = stub.flow.use('Database');
				db.once('Post.find', function (input, output) {
					input.fields.should.have.property('guid', 1);
					input.fields.should.have.property('title', 1);
					output.data = [];
					output.data.push ({guid: 'test-db-guid-01', title:'Test DB Title 01!'});
				});
				stub.flow.next = function() {
					var sync = stub.flow.use('Sync');
					var list = sync.noteList.all();
					list.should.length(1);
					list[0].should.have.property('key', 'test-db-guid-01');
					list[0].should.have.property('body', 'Test DB Title 01!');
					done();
				};
				flow.Model.Database(stub.flow);
			});
		});
	});
	describe('#View', function() {
		it('Syncをアンロックする。', function(done) {
			var sync = stub.flow.use('Sync');
			var check = false;
			sync.lock('BatchSyncAll');
			sync.on('unlock', function() {
				check = true;
			});
			stub.flow.next = function() {
				setTimeout(function() {
					check.should.eql(true);
					done();
				}, 5);
			};
			flow.View(stub.flow);
		});
	});
});
var flow = require('../../../app/flows/BatchSyncNote.js');
var stub, Stub = require('../../stub/index.js');

describe('Flows.BatchSyncNote', function() {
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
		it('ロック取得に失敗した場合はエラーBatchSyncNoteを残して終了。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.lock('Test').should.eql(true);
			stub.flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				error.should.have.property('key', 'BatchSyncNote');
				error.should.have.property('body');
				done();
			}, 5);
			flow.Controller(stub.flow);
		});
	});
	describe('#Model', function(done) {
		it('Syncコンポーネントのリスト内のノートをEvernoteから取得して、データベースに保存する。', function (done) {
			var sync = stub.flow.use('Sync');
			var db = stub.flow.use('Database');
			sync.noteList.add('TEST-NOTE', 'testNote!');
			var checkSave = false;
			db.once('Post.save', function (input, output) {
				checkSave = true;
			});
			stub.flow.next = function () {
				checkSave.should.eql(true);
				done();
			};
			flow.Model(stub.flow);
		});
		it('ノートリストが空の時は何もしない。', function (done) {
			var db = stub.flow.use('Database');
			db.once('Post.save', function (input, output) {
				throw new Error ('Post.save should note be called.');
			});
			stub.flow.next = function () {
				db.removeAllListeners();
				done();
			};
			flow.Model(stub.flow);
		});
		it('エラーがなく、取得できなかったノートはPostから削除される。', function(done) {
			var sync = stub.flow.use('Sync');
			var db = stub.flow.use('Database');
			sync.noteList.add('NOTHING-NOTE', 'testNote!');
			var checkRemove = false;
			db.once('Post.remove', function (input, output) {
				checkRemove = true;
			});
			stub.flow.next = function () {
				checkRemove.should.eql(true);
				done();
			};
			flow.Model(stub.flow);
		});
		it('同期完了したノートはキューから削除される。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.noteList.add('TEST-NOTE', 'testNote!');
			stub.flow.next = function () {
				sync.noteList.count().should.eql(0);
				done();
			};
			flow.Model(stub.flow);
		});
		it('同じURLのポストがデータベースにある場合、対象のノートはエラーになり、キューからも削除される。');
		it('同じURLであっても、同じGUIDの場合、上書き保存される。');
		it('同じGUIDの場合、異なるURLであっても上書き保存される。');
		it('GUIDがデータベースにない場合は新規保存される。');
		it('取得時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。対象の記事は変更されない。', function (done) {
			var sync = stub.flow.use('Sync');
			var db = stub.flow.use('Database');
			var evernote = stub.flow.use('Evernote');
			sync.noteList.add('NOTHING-NOTE', 'testNote!');
			evernote.once('getNote', function (input, output) {
				output.err = {
					errorCode: 6,
					message: 'Test Error Message!'
				};
			});
			db.once('Post.save', function (data, next) {
				throw new Error('post.save should not processing.');
			});
			stub.flow.next = function () {
				var err = sync.errorList.get();
				err.key.should.eql('NOTHING-NOTE');
				err.body.should.eql('{"errorCode":6,"message":"Test Error Message!"}');
				sync.noteList.count().should.eql(0);
				
				db.removeAllListeners();
				done();
			};
			flow.Model(stub.flow);
		});
		it('保存時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function (done) {
			var sync = stub.flow.use('Sync');
			var db = stub.flow.use('Database');
			sync.noteList.add('NOTHING-NOTE', 'testNote!');
			db.once('Post.remove', function (input, output) {
				output.err = {
						message: 'Test Error Message!'
					};
			});
			stub.flow.next = function () {
				var err = sync.errorList.get();
				err.key.should.eql('NOTHING-NOTE');
				err.body.should.eql('{"message":"Test Error Message!"}');
				sync.noteList.count().should.eql(0);
				
				db.removeAllListeners();
				done();
			};
			flow.Model(stub.flow);
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

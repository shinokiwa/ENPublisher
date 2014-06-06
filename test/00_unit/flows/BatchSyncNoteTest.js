var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var sinon = lib.sinon;
var App = lib.require('app.js');
var data = require('../data/evernote.js');
var flow, sync, app;

before(function(done) {
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

describe('Flows/BatchSyncTest', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.BatchSyncNote();
			sync = flow.use('Sync');
			done();
		});
		app.process();
	});
	afterEach(function() {
		if (flow.lock) {
			sync.unlock(flow.lock);
		}
	});

	describe('#Controller', function() {
		it('Syncコンポーネントからロックを取得して、flow.lockにキーを保持する。', function(done) {
			var next = function() {
				var lock = sync.lock('Test');
				expect(lock).to.eql(0);
				expect(flow).to.have.property('lock');
				expect(flow.lock).to.not.eql(undefined);
				expect(flow.lock).to.not.eql(null);
				expect(flow.lock).to.not.eql(0);
				done();
			};
			flow.step('Controller', next)();
		});
		it('ロック取得に失敗した場合はエラーBatchSyncNoteを残して終了。', function(done) {
			var lock = sync.lock('Test');
			expect(lock).to.not.eql(0);
			var next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				expect(error).to.have.property('key', 'BatchSyncNote');
				expect(error).to.have.property('body');
				sync.unlock(lock);
				done();
			}, 5);
			flow.step('Controller', next)();
		});
	});
	describe('#Model', function(done) {
		it('Syncコンポーネントのリスト内のノートをEvernoteから取得して、データベースに保存する。', function(done) {
			var sync = flow.use('Sync');
			sync.noteList.add('TEST-NOTE-GUID-1', 'testNote!');
			var next = function() {
				var Post = flow.use('Database').model('Post');
				Post.find({
					guid : 'TEST-NOTE-GUID-1'
				}, function(err, data) {
					expect(err).to.eql(null);
					expect(data).to.length(1);
					expect(data[0]).to.have.property('guid', 'TEST-NOTE-GUID-1');
					expect(data[0]).to.have.property('title', 'TEST-TITLE-1');
					done();
				});
			};
			flow.step('Model', next)();
		});
		it('ノートリストが空の時は何もしない。', function(done) {
			var next = function() {
				var Post = flow.use('Database').model('Post');
				Post.count({}, function(err, count) {
					expect(err).to.eql(null);
					expect(count).to.eql(32);
					done();
				});
			};
			flow.step('Model', next)();
		});
		it('エラーがなく、取得できなかったノートはPostから削除される。', function(done) {
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'NOTHING-NOTE',
				title : 'testNote!',
				url : 'testNote!'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('NOTHING-NOTE', 'testNote!');
				var next = function() {
					Post.count({
						guid : 'NOTHING-NOTE'
					}, function(err, count) {
						expect(count).to.eql(0);
						done();
					});
				};
				flow.step('Model', next)();
			});
		});
		it('同期完了したノートはリストから削除される。', function(done) {
			sync.noteList.add('TEST-NOTE', 'testNote!');
			var next = function() {
				expect(sync.noteList.count()).to.eql(0);
				done();
			};
			flow.step('Model', next)();
		});
		it('同じURLのポストがデータベースにある場合、対象のノートはエラーになり、キューからも削除される。', function(done) {
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'DUPLICATE-NOTE',
				title : 'TEST-TITLE-50',
				url : 'TEST-TITLE-50'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('TEST-NOTE-GUID-50', 'TEST-TITLE-50');
				var next = function() {
					Post.count({
						title : 'TEST-TITLE-50'
					}, function(err, count) {
						expect(count).to.eql(1);
						expect(sync.noteList.count()).to.eql(0);
						expect(sync.errorList.count()).to.eql(1);
						var err = sync.errorList.get();
						expect(err.key).to.eql('TEST-NOTE-GUID-50');
						done();
					});
				};
				flow.step('Model', next)();
			});
		});
		it('同じURLであっても、同じGUIDの場合、上書き保存される。', function(done) {
			var Post = flow.use('Database').model('Post');
			sync.noteList.add('TEST-NOTE-GUID-3', 'TEST-TITLE-3');
			var next = function() {
				Post.find({
					guid : 'TEST-NOTE-GUID-3'
				}, function(err, data) {
					expect(data).to.length(1);
					expect(sync.noteList.count()).to.eql(0);
					expect(sync.errorList.count()).to.eql(0);
					expect(data[0].title).to.eql('TEST-TITLE-3');
					done();
				});
			};
			flow.step('Model', next)();
		});
		it('同じGUIDの場合、異なるURLであっても上書き保存される。', function(done) {
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'TEST-NOTE-GUID-51',
				title : 'TEST',
				url : 'TEST'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('TEST-NOTE-GUID-51', 'TEST-TITLE-4');
				var next = function() {
					Post.find({
						guid : 'TEST-NOTE-GUID-51'
					}, function(err, data) {
						expect(data).to.length(1);
						expect(sync.noteList.count()).to.eql(0);
						expect(sync.errorList.count()).to.eql(0);
						expect(data[0].url).to.eql('TEST-TITLE-51');
						done();
					});
				};
				flow.step('Model', next)();
			});
		});
		it('GUIDがデータベースにない場合は新規保存される。', function(done) {
			sync.noteList.add('TEST-NOTE-GUID-52', 'testNote!');
			var next = function() {
				var Post = flow.use('Database').model('Post');
				Post.find({
					guid : 'TEST-NOTE-GUID-52'
				}, function(err, data) {
					expect(err).to.eql(null);
					expect(data).to.length(1);
					expect(data[0]).to.have.property('guid', 'TEST-NOTE-GUID-52');
					expect(data[0]).to.have.property('title', 'TEST-TITLE-52');
					done();
				});
			};
			flow.step('Model', next)();
		});
		it('取得時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。対象の記事は変更されない。', function(done) {
			var Post = flow.use('Database').model('Post');
			data.nextError({
				errorCode : 1
			});
			sync.noteList.add('TEST-NOTE-GUID-6', 'TEST-TITLE-6');
			var next = function() {
				Post.find({
					guid : 'TEST-NOTE-GUID-6'
				}, function(err, data) {
					expect(data).to.length(1);
					expect(sync.noteList.count()).to.eql(0);
					expect(sync.errorList.count()).to.eql(1);
					expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-6');
					expect(data[0].url).to.eql('TEST-TITLE-6');
					done();
				});
			};
			flow.step('Model', next)();
		});
		it('重複チェック時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function(done) {
			var Post = flow.use('Database').model('Post');
			var stub = sinon.stub(Post, 'find', function(c, callback) {
				callback({
					message : 'Test Error!'
				});
			});

			sync.noteList.add('TEST-NOTE-GUID-7', 'TEST-TITLE-7');
			var next = function() {
				expect(sync.noteList.count()).to.eql(0);
				expect(sync.errorList.count()).to.eql(1);
				expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-7');
				Post.find.restore();
				done();
			};
			flow.step('Model', next)();
		});
		it('上書き保存時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function(done) {
			var Post = flow.use('Database').model('Post');

			var stub = sinon.stub(Post.prototype, 'save', function(callback) {
				callback({
					message : 'Test Error!'
				});
			});

			sync.noteList.add('TEST-NOTE-GUID-1', 'TEST-TITLE-1');
			var next = function() {
				expect(sync.noteList.count()).to.eql(0);
				expect(sync.errorList.count()).to.eql(1);
				expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-1');
				Post.prototype.save.restore();
				done();
			};
			flow.step('Model', next)();
		});
		it('新規保存時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function(done) {
			var Post = flow.use('Database').model('Post');

			var stub = sinon.stub(Post.prototype, 'save', function(callback) {
				callback({
					message : 'Test Error!'
				});
			});

			sync.noteList.add('TEST-NOTE-GUID-8', 'TEST-TITLE-(');
			var next = function() {
				expect(sync.noteList.count()).to.eql(0);
				expect(sync.errorList.count()).to.eql(1);
				expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-8');
				Post.prototype.save.restore();
				done();
			};
			flow.step('Model', next)();
		});
	});
	describe('#View', function() {
		it('Syncをflow.lockを使ってアンロックする。', function(done) {
			flow.lock = sync.lock('Test-lock');
			var next = function() {
				expect(sync.lock('test')).to.not.eql(0);
				done();
			};
			flow.step('View', next)();
		});
	});
});

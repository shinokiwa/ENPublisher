var sinon = require('sinon');
var chai = require('chai');
var should = chai.should(), expect = chai.expect;

var setup = require('../setup.js');
var suite, flow, test;

var data = require('../data/evernote.js');
var db = require('../data/db.js');

describe('Flows/BatchSyncTest', function() {
	beforeEach(function(done) {
		suite = setup(function() {
			db.init(function() {
				done();
			});
		});
		flow = suite.flow;
		test = suite.require('flows/BatchSyncNote.js');
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
		it('ロック取得に失敗した場合はエラーBatchSyncNoteを残して終了。', function(done) {
			var sync = flow.use('Sync');
			sync.lock('Test').should.not.eql(0);
			flow.next = function() {
				throw new Error('flow.next should not be called.');
			};
			setTimeout(function() {
				var error = sync.errorList.get();
				expect(error).to.have.property('key', 'BatchSyncNote');
				expect(error).to.have.property('body');
				done();
			}, 5);
			test.Controller(flow);
		});
	});
	describe('#Model', function(done) {
		it('Syncコンポーネントのリスト内のノートをEvernoteから取得して、データベースに保存する。', function(done) {
			var sync = flow.use('Sync');
			sync.noteList.add('TEST-NOTE-GUID-1', 'testNote!');
			flow.next = function() {
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
			test.Model(flow);
		});
		it('ノートリストが空の時は何もしない。', function(done) {
			flow.next = function() {
				var Post = flow.use('Database').model('Post');
				Post.count({}, function(err, count) {
					expect(err).to.eql(null);
					expect(count).to.eql(1);
					done();
				});
			};
			test.Model(flow);
		});
		it('エラーがなく、取得できなかったノートはPostから削除される。', function(done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'NOTHING-NOTE',
				title : 'testNote!',
				url : 'testNote!'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('NOTHING-NOTE', 'testNote!');
				flow.next = function() {
					Post.count({
						guid : 'NOTHING-NOTE'
					}, function(err, count) {
						expect(count).to.eql(0);
						done();
					});
				};
				test.Model(flow);
			});
		});
		it('同期完了したノートはリストから削除される。', function(done) {
			var sync = flow.use('Sync');
			sync.noteList.add('TEST-NOTE', 'testNote!');
			flow.next = function() {
				expect(sync.noteList.count()).to.eql(0);
				done();
			};
			test.Model(flow);
		});
		it('同じURLのポストがデータベースにある場合、対象のノートはエラーになり、キューからも削除される。', function (done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'DUPLICATE-NOTE',
				title : 'TEST-TITLE-2',
				url : 'TEST-TITLE-2'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('TEST-NOTE-GUID-2', 'TEST-TITLE-2');
				flow.next = function() {
					Post.count({
						title : 'TEST-TITLE-2'
					}, function(err, count) {
						expect(count).to.eql(1);
						expect(sync.noteList.count()).to.eql(0);
						expect(sync.errorList.count()).to.eql(1);
						var err = sync.errorList.get();
						expect(err.key).to.eql('TEST-NOTE-GUID-2');
						done();
					});
				};
				test.Model(flow);
			});
		});
		it('同じURLであっても、同じGUIDの場合、上書き保存される。', function (done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'TEST-NOTE-GUID-3',
				title : 'TEST',
				url : 'TEST-TITLE-3'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('TEST-NOTE-GUID-3', 'TEST-TITLE-3');
				flow.next = function() {
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
				test.Model(flow);
			});
		});
		it('同じGUIDの場合、異なるURLであっても上書き保存される。', function (done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');
			Post.create({
				guid : 'TEST-NOTE-GUID-4',
				title : 'TEST',
				url : 'TEST'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('TEST-NOTE-GUID-4', 'TEST-TITLE-4');
				flow.next = function() {
					Post.find({
						guid : 'TEST-NOTE-GUID-4'
					}, function(err, data) {
						expect(data).to.length(1);
						expect(sync.noteList.count()).to.eql(0);
						expect(sync.errorList.count()).to.eql(0);
						expect(data[0].url).to.eql('TEST-TITLE-4');
						done();
					});
				};
				test.Model(flow);
			});
		});
		it('GUIDがデータベースにない場合は新規保存される。', function(done) {
			var sync = flow.use('Sync');
			sync.noteList.add('TEST-NOTE-GUID-5', 'testNote!');
			flow.next = function() {
				var Post = flow.use('Database').model('Post');
				Post.find({
					guid : 'TEST-NOTE-GUID-5'
				}, function(err, data) {
					expect(err).to.eql(null);
					expect(data).to.length(1);
					expect(data[0]).to.have.property('guid', 'TEST-NOTE-GUID-5');
					expect(data[0]).to.have.property('title', 'TEST-TITLE-5');
					done();
				});
			};
			test.Model(flow);
		});
		it('取得時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。対象の記事は変更されない。', function(done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');
			data.nextError({errorCode: 1});
			Post.create({
				guid : 'TEST-NOTE-GUID-6',
				title : 'TEST6',
				url : 'TEST6'
			}, function(err) {
				expect(err).to.eql(null);
				sync.noteList.add('TEST-NOTE-GUID-6', 'TEST-TITLE-6');
				flow.next = function() {
					Post.find({
						guid : 'TEST-NOTE-GUID-6'
					}, function(err, data) {
						expect(data).to.length(1);
						expect(sync.noteList.count()).to.eql(0);
						expect(sync.errorList.count()).to.eql(1);
						expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-6');
						expect(data[0].url).to.eql('TEST6');
						done();
					});
				};
				test.Model(flow);
			});
		});
		it('重複チェック時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function(done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');

			var stub = sinon.stub(Post, 'find', function (c, callback) {
				callback({message: 'Test Error!'});
			});

			sync.noteList.add('TEST-NOTE-GUID-7', 'TEST-TITLE-7');
			flow.next = function() {
				expect(sync.noteList.count()).to.eql(0);
				expect(sync.errorList.count()).to.eql(1);
				expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-7');
				Post.find.restore();
				done();
			};
			test.Model(flow);
		});
		it('上書き保存時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function(done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');

			var stub = sinon.stub(Post.prototype, 'save', function (callback) {
				callback({message: 'Test Error!'});
			});

			sync.noteList.add('TEST-NOTE-GUID-1', 'TEST-TITLE-1');
			flow.next = function() {
				expect(sync.noteList.count()).to.eql(0);
				expect(sync.errorList.count()).to.eql(1);
				expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-1');
				Post.prototype.save.restore();
				done();
			};
			test.Model(flow);
		});
		it('新規保存時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function(done) {
			var sync = flow.use('Sync');
			var Post = flow.use('Database').model('Post');

			var stub = sinon.stub(Post.prototype, 'save', function (callback) {
				callback({message: 'Test Error!'});
			});

			sync.noteList.add('TEST-NOTE-GUID-8', 'TEST-TITLE-(');
			flow.next = function() {
				expect(sync.noteList.count()).to.eql(0);
				expect(sync.errorList.count()).to.eql(1);
				expect(sync.errorList.get()).to.have.property('key', 'TEST-NOTE-GUID-8');
				Post.prototype.save.restore();
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
	});
});

var flow = require('../../../app/flows/batchsyncnote.js');
var Input = require ('../../stub/input.js');
var input, sync,evernote,output,post;
var clear = function () {
	input = new Input();
	sync = input.components.sync();
	evernote = input.components.evernote();
	post = input.components.post();
	output = {};
};

describe('flows.batchsyncnote', function() {
	describe('#model(input,output,next)', function(done) {
		it('SyncコンポーネントのキューにあるノートをEvernoteから取得して、データベースに保存する。', function (done) {
			clear();
			sync.queue([{guid:'TEST-NOTE', title:'testNote!'}]);
			var check1 = false;
			var check2 = false;
			evernote.preGetNote = function (guid, next) {
				guid.should.eql('TEST-NOTE');
				check1 = true;
				next();
			};
			post.preSave = function (data, next) {
				data.guid.should.eql('TEST-NOTE');
				data.title.should.eql('testNote!');
				check2 = true;
				next();
			};
			flow.model(input, output, function () {
				check1.should.be.ok;
				check2.should.be.ok;
				done();
			});
		});
		it('エラーがなく、取得できなかったノートはPostから削除される。', function(done) {
			clear();
			sync.queue([{guid:'NOTHING-NOTE', title:'testNote!'}]);
			var check1 = false;
			post.preRemove = function (guid, next) {
				guid.should.eql('NOTHING-NOTE');
				check1 = true;
				next();
			};
			flow.model(input, output, function () {
				check1.should.be.ok;
				done();
			});
		});
		it('同期完了したノートはキューから削除される。', function(done) {
			clear ();
			sync.queue(evernote.list);
			flow.model(input, output, function() {
				sync.queuedNotes.length.should.eql(0);
				done();
			});
		});
		it('取得時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。対象の記事は変更されない。', function (done) {
			clear();
			sync.queue([{guid:'NOTHING-NOTE', title:'testNote!'}]);
			evernote.preGetNote = function (guid, next) {
				next({
					errorCode: 6,
					message: 'Test Error Message!'
				});
			};
			post.preSave = function (data, next) {
				throw new Error('post.save should not processing.');
				next();
			};
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				sync.error[0].should.eql('SyncNote: {guid: NOTHING-NOTE , title: testNote! } Test Error Message!');
				done();
			});
		});
		it('保存時にエラーになった場合、Syncコンポーネントにメッセージを残して処理を続行する。', function (done) {
			clear();
			sync.queue([{guid:'TEST-NOTE', title:'testNote!'}]);
			post.preSave = function (data, next) {
				next({
					message: 'Duplication Post ID.'
				});
			};
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				sync.error[0].should.eql('SyncNote: {guid: TEST-NOTE , title: testNote! } Duplication Post ID.');
				done();
			});
			
		});
		it('キューの処理は先頭から順に実行される。', function (done) {
			clear ();
			this.timeout(15*1000);
			sync.queue([{guid:'1', title:'test1'},{guid:'2', title:'test2'}]);
			var count = 0;
			evernote.preGetNote = function (guid, next) {
				count++;
				sync.queuedNotes.length.should.eql(2 - count);
				guid.should.eql(count.toString());
				next();
			};
			flow.model(input, output, function() {
				count.should.eql(2);
				done();
			});
		});
		it('キューにノートが残っている場合は、10秒後に自分自身を呼び出す。キューのノートがなくなるまで繰り返される。', function (done) {
			clear ();
			this.timeout(25*1000);
			sync.queue([{guid:'1', title:'test1'},{guid:'2', title:'test2'},{guid:'3', title:'test3'}]);
			setTimeout(function () {
				sync.queuedNotes.length.should.eql(2);
				sync.queuedNotes[0].should.have.property('guid', '2');
				setTimeout(function () {
					sync.queuedNotes.length.should.eql(1);
					sync.queuedNotes[0].should.have.property('guid', '3');
				}, 9*1000);
			}, 9*1000);
			flow.model(input, output, function() {
				sync.queuedNotes.length.should.eql(0);
				done();
			});
		});
		it('実行中はSyncコンポーネントのステータスをNOTEに更新する。完了後はnullに戻す。', function(done) {
			clear();
			sync.queue([{guid:'1', title:'test1'}]);
			evernote.preGetNote = function(guid, next) {
				setTimeout(function() {
					next();
				}, 10);
			};
			flow.model(input, output, function() {
				sync.status.should.have.property('string', null);
				done();
			});
			sync.status.should.have.property('string', 'NOTE');
		});
		it('完了後はSyncコンポーネントのdoSyncNoteを実行する。', function (done) {
			clear();
			var check = false;
			input.components._sync.doSyncChunk = function () {
				check = true;
			};
			flow.model(input, output, function () {
				check.should.be.ok;
				done();
			});
		});
		it('別の同期処理が実行中の場合は、Syncコンポーネントにメッセージを残し、同期しない。->同期終了を待って実行に改修予定。', function (done) {
			clear();
			sync.updateStatus('ALL');
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				sync.message[0].should.eql('SyncNote: Another process is running.');
				done();
			});
		});

	});
});

var flow = require('../../../app/flows/batchsyncall.js');
var Input = require ('../../stub/input.js');
var input, sync,evernote,output,post;
var clear = function () {
	input = new Input();
	sync = input.components.sync();
	evernote = input.components.evernote();
	post = input.components.post();
	output = {};
};

describe('flows.batchsyncall', function() {
	describe('#model(input,output,next)', function(done) {
		it('EvernoteコンポーネントとPostコンポーネントのgetMetaAllメソッドを呼び出し、ノートリストをSyncコンポーネントのキューに入れる。', function(done) {
			clear ();
			flow.model(input, output, function() {
				sync.queuedNotes.length.should.eql(2);
				sync.queuedNotes[0].should.have.property('guid', 'test-guid-01');
				sync.queuedNotes[0].should.have.property('title', 'Test Title 01!');
				sync.queuedNotes[1].should.have.property('guid', 'test-db-guid-01');
				sync.queuedNotes[1].should.have.property('title', 'Test DB Title 01!');
				done();
			});
		});
		it('同じGUIDのものはEvernote側のノートのみがキューに入る。', function(done) {
			clear();
			post.metaData.push({guid:'test-guid-01', title:'DB Title!'});
			flow.model(input, output, function() {
				sync.queuedNotes.length.should.eql(2);
				sync.queuedNotes[0].should.have.property('guid', 'test-guid-01');
				sync.queuedNotes[0].should.have.property('title', 'Test Title 01!');
				sync.queuedNotes[1].should.have.property('guid', 'test-db-guid-01');
				sync.queuedNotes[1].should.have.property('title', 'Test DB Title 01!');
				done();
			});
		});
		it('キューに既にノートが入っている場合、キューをクリアしてから実行する。', function(done) {
			clear ();
			for (var i = 0; i < 10; i++) {
				sync.queuedNotes.push(evernote.list[0]);
			}
			flow.model(input, output, function() {
				sync.queuedNotes.length.should.eql(2);
				sync.queuedNotes[0].should.have.property('guid', 'test-guid-01');
				sync.queuedNotes[0].should.have.property('title', 'Test Title 01!');
				done();
			});
		});
		it('現在のUSNの値に関係なく実行する。', function (done) {
			clear ();
			sync.USN = 10000000;
			flow.model(input, output, function() {
				sync.queuedNotes.length.should.eql(2);
				sync.queuedNotes[0].should.have.property('guid', 'test-guid-01');
				sync.queuedNotes[0].should.have.property('title', 'Test Title 01!');
				done();
			});
		});
		it('実行中はSyncコンポーネントのステータスをALLに更新する。完了後はnullに戻す。', function(done) {
			clear();
			evernote.preGetMetaAll = function(offset, next) {
				sync.status.should.have.property('string', 'ALL');
				setTimeout(function() {
					next();
				}, 0);
			};
			flow.model(input, output, function() {
				sync.status.should.have.property('string', null);
				done();
			});
		});
		it('一度の取得で完了しない数のノートがある場合、自分自身を再度実行する。全てのノートを取得するまで繰り返す。', function(done) {
			clear();
			evernote.setNotesCount(999);
			evernote.list.push({guid:'test-last-note', title:'LastNote!'});
			var count = 0;
			evernote.preGetMetaAll = function(i, next) {
				i.should.eql(count * 100);
				count++;
				next();
			};
			flow.model(input, output, function() {
				count.should.eql(10);
				sync.queuedNotes.length.should.eql(1001);
				sync.queuedNotes[0].should.have.property('guid', 'test-guid-01');
				sync.queuedNotes[0].should.have.property('title', 'Test Title 01!');
				sync.queuedNotes[999].should.have.property('guid', 'test-last-note');
				sync.queuedNotes[999].should.have.property('title', 'LastNote!');
				done();
			});
		});
		it('リスト同期完了後はSyncコンポーネントのUSNを更新し、updateLastSyncAllTimeを実行する。', function(done) {
			clear();
			sync.lastSyncAllTime = null;
			sync.lastSyncTime = null;
			flow.model(input, output, function() {
				sync.USN.should.eql(46);
				sync.lastSyncAllTime.should.not.eql(null);
				sync.lastSyncTime.should.not.eql(null);
				done();
			});
		});
		it('リスト同期完了後、SyncコンポーネントのdoSyncNoteを実行する。', function (done) {
			clear();
			var check = false;
			input.components._sync.doSyncNote = function () {
				check = true;
			};
			flow.model(input, output, function () {
				check.should.be.ok;
				done();
			});
		});
		it('前回実行時(lastSyncAllTime)から15分以内の場合はSyncコンポーネントにメッセージを残し、同期しない。', function (done) {
			clear();
			sync.lastSyncAllTime = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				sync.message[0].should.eql('SyncAll: Please run Sync All at intervals for more than 15 minutes all year.');
				done();
			});
		});
		it('別の同期処理が実行中の場合は、Syncコンポーネントにメッセージを残し、同期しない。->同期終了を待って実行に改修予定。', function (done) {
			clear();
			sync.updateStatus('Note');
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				sync.message[0].should.eql('SyncAll: Another process is running.');
				done();
			});
		});
		it('リスト同期中にEvernote側のUSNが更新された場合、キューを破棄して最初からやり直す(未実装)。');
	});
});
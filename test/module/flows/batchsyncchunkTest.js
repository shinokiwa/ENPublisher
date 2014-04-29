var flow = require('../../../app/flows/batchsyncchunk.js');
var Input = require ('../../stub/input.js');
var input, sync,evernote,output;
var clear = function () {
	input = new Input();
	sync = input.components.sync();
	sync.USN = 5;
	evernote = input.components.evernote();
	output = {};
};

describe('flows.batchsyncchunk', function() {
	describe('#model(input,output,next)', function(done) {
		it('SyncコンポーネントのUSNとEvernoteのUSNを比較して、Evernote側が大きい時に差分を同期する。', function(done) {
			clear ();
			flow.model(input, output, function() {
				sync.queuedNotes.should.length(1);
				sync.queuedNotes[0].should.have.property('guid', 'test-guid-1');
				sync.queuedNotes[0].should.have.property('title', 'Test Title 1');
				done();
			});
		});
		it('USNが同値、もしくはSyncコンポーネントの方が大きい時は同期せず、SyncコンポーネントのdoSyncChunkを実行する。', function (done) {
			clear();
			sync.USN = 100;
			var check = false;
			input.components._sync.doSyncChunk = function () {
				check = true;
			};
			flow.model(input, output, function () {
				check.should.be.ok;
				sync.queuedNotes.length.should.eql (0);
				done();
			});
		});
		it('SyncコンポーネントのUSNがnullの時は同期せず、SyncコンポーネントのdoSyncChunkを実行する。', function (done) {
			clear();
			sync.USN = null;
			var check = false;
			input.components._sync.doSyncChunk = function () {
				check = true;
			};
			flow.model(input, output, function () {
				check.should.be.ok;
				sync.queuedNotes.length.should.eql (0);
				done();
			});
		});
		it('キューに既にノートが入ってる場合、現在のキューに追加する。', function(done) {
			clear ();
			for (var i = 0; i < 10; i++) {
				sync.queuedNotes.push(evernote.list[0]);
			}
			flow.model(input, output, function() {
				sync.queuedNotes.should.length(11);
				sync.queuedNotes[10].should.have.property('guid', 'test-guid-1');
				sync.queuedNotes[10].should.have.property('title', 'Test Title 1');
				done();
			});
		});
		it('実行中はSyncコンポーネントのステータスをCHUNKに更新する。完了後はnullに戻す。', function(done) {
			clear();
			evernote.once('getSyncChunk', function(input, output) {
				sync.status.should.have.property('string', 'CHUNK');
			});
			flow.model(input, output, function() {
				sync.status.should.have.property('string', null);
				done();
			});
		});
		it('リスト同期完了後はSyncコンポーネントのUSNを更新し、updateSyncTimeを実行する。', function(done) {
			clear();
			sync.lastSyncAllTime = null;
			sync.lastSyncTime = null;
			flow.model(input, output, function() {
				sync.USN.should.eql(46);
				sync.should.have.property('lastSyncAllTime', null);
				sync.should.have.property('lastSyncTime').with.be.a.Date;
				done();
			});
		});
		it('同期しなかった場合はupdateSyncTimeは実行しない。', function(done) {
			clear();
			sync.lastSyncAllTime = null;
			sync.lastSyncTime = null;
			sync.USN = 100;
			flow.model(input, output, function() {
				sync.should.have.property('lastSyncAllTime', null);
				sync.should.have.property('lastSyncTime',null);
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
		it('前回実行時(lastSyncTime)から5分以内の場合は同期せず、SyncコンポーネントのdoSyncChunkを実行する。', function (done) {
			clear();
			sync.lastSyncTime = new Date((new Date()) - 5 * 60 * 1000 + 1000);
			var check = false;
			input.components._sync.doSyncChunk = function () {
				check = true;
			};
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				check.should.be.ok;
				done();
			});
		});
		it('別の同期処理が実行中の場合は同期しない。', function (done) {
			clear();
			sync.updateStatus('Note');
			flow.model(input, output, function () {
				sync.queuedNotes.length.should.eql (0);
				done();
			});
		});
	});
});
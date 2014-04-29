var com = require('../../../app/components/sync.js');
var EventEmitter = require('events').EventEmitter;
var app = new EventEmitter();

describe('components.sync', function() {
	var comSync  = com(app);
	describe('#create', function () {
		it('Syncコンポーネントの実態を取得する。', function () {
			var sync = comSync();
			sync.should.have.property('USN');
		});
		it('Syncコンポーネントには同期プロセスの状態が保持される。', function () {
			var sync = comSync();
			sync.should.have.property('status');
			sync.status.should.have.property('now');
			sync.status.should.have.property('string');
		});
		it('Syncコンポーネントには同期プロセスの状態が保持される。', function () {
			var sync = comSync();
			sync.should.have.property('status');
			sync.status.should.have.property('now');
			sync.status.should.have.property('string');
		});
		it('Syncコンポーネントは別々の変数に代入しても同一の参照となる。', function () {
			var sync = com(app)();
			var sync2 = com(app)();
			sync.should.have.property('USN', null);
			sync2.should.have.property('USN', null);
			sync.USN = 334;
			sync.should.have.property('USN', 334);
			sync2.should.have.property('USN', 334);
			sync.USN = null;
		});
	});
	describe.skip('#doSyncAll()', function () {
		it('1秒タイムアウト後、BatchSyncAllフローを実行する。', function (done) {
			this.timeout(3 * 1000);
			var sync = comSync();
			var check1 = '';
			var check2 = '';
			app.flow = function (flow) {
				return function () {
					check1 = flow;
				};
			};
			setTimeout(function () {
				check1.should.eql('');
				check2 = true;
				setTimeout(function () {
					check1.should.eql('BatchSyncAll');
					check2.should.be.ok;
					done();
				}, 2*1000);
			}, 0);
			sync.doSyncAll();
		});
	});
	describe.skip('#doSyncNote()', function () {
		it('1秒タイムアウト後、BatchSyncNoteフローを実行する。', function (done) {
			this.timeout(3 * 1000);
			var sync = comSync();
			var check1 = '';
			var check2 = '';
			app.flow = function (flow) {
				return function () {
					check1 = flow;
				};
			};
			setTimeout(function () {
				check1.should.eql('');
				check2 = true;
				setTimeout(function () {
					check1.should.eql('BatchSyncNote');
					check2.should.be.ok;
					done();
				}, 2*1000);
			}, 0);
			sync.doSyncNote();
		});
	});
	describe.skip('#doSyncChunk()', function () {
		it('1分タイムアウト後、BatchSyncChunkフローを実行する。', function (done) {
			this.timeout(65 * 1000);
			var sync = comSync();
			var check1 = '';
			var check2 = '';
			app.flow = function (flow) {
				return function () {
					check1 = flow;
				};
			};
			setTimeout(function () {
				check1.should.eql('');
				check2 = true;
				setTimeout(function () {
					check1.should.eql('BatchSyncChunk');
					check2.should.be.ok;
					done();
				}, 2*1000);
			}, 59*1000);
			sync.doSyncChunk();
		});
	});
	describe('#queue(noteList)', function () {
		it('同期するノートをキューに入れる。配列で複数のノートを指定できる。', function (done) {
			var sync = comSync();
			var noteList = [
			                {guid: 'test-guid1', title: 'test 1 ok!'},
			                {guid: 'test-guid2', title: 'test 2 ok!'}
			                ];
			sync.queue(noteList);
			sync.queuedNotes[0].guid.should.eql('test-guid1');
			sync.queuedNotes[0].title.should.eql('test 1 ok!');
			sync.queuedNotes[1].guid.should.eql('test-guid2');
			sync.queuedNotes[1].title.should.eql('test 2 ok!');
			done();
		});
	});
	describe('#clearQueue()', function () {
		it('同期キューをリセットする。', function () {
			var sync = comSync();
			sync.queuedNotes = ['a', 'b', 'c'];
			sync.clearQueue();
			sync.queuedNotes.length.should.be.eql(0);
		});
	});
	describe('#isQueued()', function () {
		it('キューにノートが入っているか判定する。入っている場合trueを返す。', function () {
			var sync = comSync();
			sync.queuedNotes = ['a', 'b', 'c'];
			sync.isQueued().should.be.ok;
		});
		it('キューが空の場合はfalseを返す。', function () {
			var sync = comSync();
			sync.queuedNotes = new Array();
			sync.isQueued().should.be.ng;
		});
	});
	describe('#USN', function () {
		it('現在のUpdateSequenceNumberが入る。当コンポーネントでは特に操作しない。初期値はnull。', function () {
			var sync = comSync ();
			sync.should.have.property('USN', null);
		});
	});
	describe('#updateLastSyncAllTime()', function () {
		it('lastSyncAllTime、およびlastSyncTimeを現在時刻で更新する。', function () {
			// このテストは時刻を使用するため、実行タイミングによっては稀にNGになる事がある。
			var sync = comSync ();
			sync.should.have.property('lastSyncTime', null);
			sync.should.have.property('lastSyncAllTime', null);
			var now = new Date();
			sync.updateLastSyncAllTime();
			sync.should.have.property('lastSyncTime', now);
			sync.should.have.property('lastSyncAllTime', now);
			sync.lastSyncTime = null;
			sync.lastSyncAllTime = null;
		});
	});
	describe('#updateLastSyncTime()', function () {
		it('lastSyncTimeを現在時刻で更新する。lastSyncAllTimeは変化しない。', function () {
			// このテストは時刻を使用するため、実行タイミングによっては稀にNGになる事がある。
			var sync = comSync ();
			sync.should.have.property('lastSyncTime', null);
			sync.should.have.property('lastSyncAllTime', null);
			var now = new Date();
			sync.updateLastSyncTime();
			sync.should.have.property('lastSyncTime', now);
			sync.should.have.property('lastSyncAllTime', null );
			sync.lastSyncTime = null;
			sync.lastSyncAllTime = null;
		});
	});
	describe('#updateStatus(status)', function () {
		it('status.nowおよびstatus.stringを更新する。NULLを渡された場合はnow:null、string:WAITになる。', function (done) {
			var sync = comSync();
			sync.should.have.property('status');
			sync.status.should.have.property('now', false);
			sync.status.should.have.property('string');
			sync.updateStatus('ALL');
			sync.status.should.have.property('now', true);
			sync.status.should.have.property('string', 'ALL');
			sync.updateStatus(null);
			sync.status.should.have.property('now', false);
			sync.status.should.have.property('string', 'WAIT');
			done();
		});
		it('15分間updateStatusの呼び出しがなかった場合、string:nullに戻る。');
	});
});
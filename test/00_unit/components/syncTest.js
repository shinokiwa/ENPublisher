var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
var sinon = lib.sinon;
var App = lib.require('app.js');
var List = lib.require('components/sync/list.js');
var Sync, sync, sync2, app;

describe('components/sync', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			sync = this.use('Sync');
			sync2 = this.use('Sync');
			Sync = sync.constructor;
			next();
			done();
		});
		app.process();
	});
	it('バックエンドで同期処理を制御するコンポーネント。フロー中にuseで取得できる。', function() {
		sync.should.be.an('object');
	});
	it('syncコンポーネントは別々の変数に代入しても同一の参照となる。', function() {
		sync.should.have.property('USN', null);
		sync2.should.have.property('USN', null);
		sync.USN = 334;
		sync.should.have.property('USN', 334);
		sync2.should.have.property('USN', 334);
	});
	it('Configureフロー実行の度に再生成される。その際、duration(10)を動作させる。', function(done) {
		var spy = sinon.spy(Sync.prototype, 'duration');

		sync.test = 'TestValue!';
		sync.USN = 10;
		app.configure(function(configure, next) {
			var sync = this.use('Sync');
			sync.should.not.have.property('test');
			sync.should.have.property('USN', null);

			expect(spy.calledOnce).to.eql(true);
			expect(spy.calledWith(10)).to.eql(true);

			Sync.prototype.duration.restore();

			next();
			done();
		});
		app.flow('Configure')(require(app._configure));
	});
	describe('#USN', function() {
		it('EvernoteのUpdateSequenceNumberを保持する属性。初期値NULL。', function() {
			sync.should.have.property('USN', null);
		});
	});
	describe('#lastSync', function() {
		it('最終同期時刻を保持する属性。初期値NULL。', function() {
			sync.should.have.property('lastSync', null);
		});
	});
	describe('#lastSyncAll', function() {
		it('全同期の最終同期時刻を保持する属性。初期値NULL。', function() {
			sync.should.have.property('lastSyncAll', null);
		});
	});
	describe('#message', function() {
		it('ロックのメッセージを保持する属性。初期値NULL。', function() {
			sync.should.have.property('message', null);
		});
	});
	describe('#intervalSyncAll', function() {
		it('全同期を禁止する時間を保持する属性。初期値15分。実際の値はミリ秒。', function() {
			sync.should.have.property('intervalSyncAll', 15 * 60 * 1000);
		});
		it('prototypeに定義されているので、値を変更してもdeleteで初期化できる。', function() {
			sync.intervalSyncAll = 80;
			delete (sync.intervalSyncAll);
			sync.should.have.property('intervalSyncAll', 15 * 60 * 1000);
		});
	});

	describe('#noteList', function() {
		it('同期するノートのリストを保持する属性。component/sync/list型を使用する。', function() {
			sync.should.have.property('noteList');
			sync.noteList.should.be.instanceOf(List);
		});
	});
	describe('#tagList', function() {
		it('同期するタグのリストを保持する属性。component/sync/list型を使用する。', function() {
			sync.should.have.property('tagList');
			sync.tagList.should.be.instanceOf(List);
		});
	});
	describe('#errorList', function() {
		it('同期エラーのリストを保持する属性。component/sync/list型を使用する。', function() {
			sync.should.have.property('errorList');
			sync.errorList.should.be.instanceOf(List);
		});
	});

	describe('#lock(message)', function() {
		it('同期処理のロックを取得する。取得に成功した場合はロック解除キー(1以上の乱数)を返す。', function() {
			sync.lock('Test').should.be.least(1);
		});
		it('ロック取得失敗(既に取得済み)の場合は0を返す。', function() {
			sync.lock('Test').should.be.least(1);
			sync.lock('Test').should.eql(0);
		});
		it('ロック中にはロック時に指定したmessageがmessage属性に入る。', function() {
			sync.lock('Test').should.be.least(1);
			sync.message.should.eql('Test');
		});
		it('ロック取得失敗時にはmessageは更新されない。', function() {
			sync.lock('Test1').should.be.least(1);
			sync.lock('Test2').should.eql(0);
			sync.message.should.eql('Test1');
		});
	});
	describe('#unlock(key)', function() {
		it('同期処理のロックを解除する。引数にはロック取得時の解除キーを渡す。', function() {
			var key = sync.lock('Test1');
			key.should.be.least(1);
			sync.unlock(key);
			sync.lock('Test2').should.be.least(1);
		});
		it('解除キーが間違っている場合、ロックは解除されない。', function() {
			var key = sync.lock('Test1');
			key.should.be.least(1);
			sync.unlock(key + 1);
			sync.lock('Test2').should.be.eql(0);
		});
		it('解放後はmessage属性がnullになる。', function() {
			var key = sync.lock('Test');
			key.should.be.least(1);
			sync.message.should.eql('Test');
			sync.unlock(key);
			sync.should.have.property('message', null);
		});
	});

	describe('#doSyncAll()', function() {
		it('全同期(BatchSyncAll)フローを実行する。', function(done) {
			app.add('BatchSyncAll', {
				Controller : function(next) {
					done();
				}
			});
			sync.doSyncAll();
		});
		it('ロックがかかっている場合、ロックの開放時に実行する。', function(done) {
			app.add('BatchSyncAll', {
				Controller : function(next) {
					check.should.eql(true);
					done();
				}
			});
			var key = sync.lock('Test');
			var check = false;
			sync.doSyncAll();
			setTimeout(function() {
				check = true;
				sync.unlock(key);
			}, 5);
		});
		it('アンロック待ちになった後は、複数回アンロックしても一度だけ実行される。', function(done) {
			var check = 0;
			app.add('BatchSyncAll', {
				Controller : function(next) {
					check++;
				}
			});
			var key = sync.lock('Test');
			key.should.not.eql(0);
			sync.doSyncAll();
			setTimeout(function() {
				check.should.eql(0);
				sync.unlock(key);
				setTimeout(function() {
					check.should.eql(1);
					key = sync.lock('Test');
					key.should.not.eql(0);
					sync.unlock(key);
					setTimeout(function() {
						check.should.eql(1);
						done();
					}, 5);
				}, 5);
			}, 5);
		});
		it('前回実行時(lastSyncAll)からintervalSyncAll(ミリ秒、初期15分)以内の場合は同期しない。', function(done) {
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			app.add('BatchSyncAll', {
				Controller : function(next) {
					throw new Error('Flow BatchSyncAll should not be called.');
				}
			});
			sync.doSyncAll();
			setTimeout(function() {
				done();
			}, 5);
		});
		it('intervalSyncAllの値を変更すると同期禁止期間を操作できる。', function(done) {
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			sync.intervalSyncAll = 14 * 60 * 1000;
			app.add('BatchSyncAll', {
				Controller : function(next) {
					done();
				}
			});
			sync.doSyncAll();
		});
		it('前回実行時(lastSyncAll)から15分以内に実行した場合、BatchSyncAllのキーでエラーが追加される。', function() {
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			sync.doSyncAll();
			sync.errorList.count().should.eql(1);
			var error = sync.errorList.get();
			error.should.have.property('key', 'BatchSyncAll');
		});
		it('ロック時はロック解除の段階でBatchSyncAllのキーでエラーが追加される。', function() {
			var key = sync.lock('Test');
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			sync.doSyncAll();
			sync.errorList.count().should.eql(0);
			sync.unlock(key);
			sync.errorList.count().should.eql(1);
			var error = sync.errorList.get();
			error.should.have.property('key', 'BatchSyncAll');
		});
	});
	describe('#duration(timer)', function() {
		it('次回同期までのタイマを設定する。単位は秒。', function() {
			sync._duration.should.eql(10);
			sync.duration(100);
			sync._duration.should.eql(100);
		});
		it('実行後、Sync.timeoutTick()を実行する。', function() {
			var spy = sinon.spy(sync.constructor, 'timeoutTick');
			sync.duration(100);
			expect(spy.calledOnce).to.eql(true);
			sync.constructor.timeoutTick.restore();
		});
	});
	describe('#tick()', function() {
		it('次回同期までのタイマを-1する。', function() {
			sync._duration = 1000;
			sync.tick();
			sync._duration.should.eql(999);
		});
		it('ロック中の場合、タイマはデクリメントされない。', function() {
			sync.lock('Timer');
			sync._duration = 1000;
			sync.tick();
			sync._duration.should.eql(1000);
		});
		it('タイマが0になった場合、BatchSyncChunkフローを実行する。', function() {
			var stub = sinon.stub(app, 'flow').returns(function() {
			});
			sync._duration = 1;
			sync.tick();
			sync._duration.should.eql(0);
			expect(stub.calledWith('BatchSyncChunk')).to.eql(true);
			app.flow.restore();
		});
		it('タイマが0でなく、同期待ちノートがある場合、BatchSyncNoteフローを実行する。', function() {
			var stub = sinon.stub(app, 'flow').returns(function() {
			});
			sync.noteList.add('TEST-NOTE', 'AAAA');
			sync._duration = 5;
			sync.tick();
			expect(stub.calledWith('BatchSyncNote')).to.eql(true);
			app.flow.restore();
		});
		it('タイマが0でなく、同期待ちノートがなく、同期待ちタグがある場合、BatchSyncTagフローを実行する。', function() {
			var stub = sinon.stub(app, 'flow').returns(function() {
			});
			sync.tagList.add('TEST-TAG', 'AAAA');
			sync._duration = 5;
			sync.tick();
			expect(stub.calledWith('BatchSyncChunk')).to.eql(false);
			expect(stub.calledWith('BatchSyncTag')).to.eql(true);
			app.flow.restore();
		});
		it('タイマが残っている場合、Sync.timeoutTickを実行する。ロック中、同期待ちがある状態でも実行する。', function() {
			var stub = sinon.stub(app, 'flow').returns(function() {
			});
			var spy = sinon.spy(Sync, 'timeoutTick');
			sync._duration = 5;
			sync.tick();
			var lock = sync.lock('Timer');
			sync._duration = 1000;
			sync.tick();
			sync.unlock(lock);
			sync.noteList.add('TEST-NOTE', 'AAAA');
			sync._duration = 5;
			sync.tick();
			sync.tagList.add('TEST-TAG', 'AAAA');
			sync._duration = 5;
			sync.tick();
			expect(spy.callCount).to.eql(4);
			Sync.timeoutTick.restore();
			app.flow.restore();
		});
		it('タイマがメソッド実行前から0の場合は何もしない。', function() {
			var spyFlow = sinon.spy(app, 'flow');
			var spyTick = sinon.spy(sync.constructor, 'timeoutTick');
			sync._duration = 0;
			sync.tick();
			expect(spyFlow.called).to.eql(false);
			expect(spyTick.called).to.eql(false);
			app.flow.restore();
			sync.constructor.timeoutTick.restore();
		});
	});
	describe('#Sync.timeoutTick(sync)', function() {
		it('クラスメソッド。1秒タイムアウト後にtickを実行する。', function(done) {
			var spy = sinon.spy(sync, 'tick');
			Sync.timeoutTick(sync);
			expect(spy.called).to.eql(false);
			setTimeout(function() {
				expect(spy.called).to.eql(true);
				done();
			}, 1200);
		});
		it('既に別のタイマがセットされている場合は、クリアしてから実行する。', function(done) {
			var spy = sinon.spy(sync, 'tick');
			Sync.timeoutTick(sync);
			expect(spy.called).to.eql(false);
			setTimeout(function() {
				Sync.timeoutTick(sync);
				setTimeout(function() {
					expect(spy.calledOnce).to.eql(true);
					done();
				}, 1050);
			}, 500);
		});
	});
});
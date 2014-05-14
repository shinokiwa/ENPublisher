var stub, Stub = require('../../stub/index.js');
var EventEmitter = require('events').EventEmitter;

describe('Components.sync', function() {
	beforeEach(function(done) {
		stub = Stub();
		stub.flow.locals.configure = {
			evernote : {
				"token" : "TEST-TOKEN",
				"notebookGuid" : "COLLECT-NOTEBOOK",
				"publishedGuid" : "TEST-PUBLISEHD-GUID",
				"sandbox" : false
			}
		};
		stub.flow.next = function() {
			delete (stub.flow.locals.configure);
			stub.flow.next = function() {
			};
			done();
		};
		stub.app.emit('Model.LoadConfig', stub.flow);
	});
	it('syncコンポーネント実体を取得する。', function() {
		stub.flow.use('Sync').should.be.Object;
	});
	it('syncコンポーネントはEventEmitterを継承したクラスである。', function() {
		stub.flow.use('Sync').should.be.instanceOf(EventEmitter);
	});
	it('syncコンポーネントはUSN、message、lastSync、lastSyncAll,stanby属性を持つ。', function() {
		stub.flow.use('Sync').should.have.property('USN');
		stub.flow.use('Sync').should.have.property('message');
		stub.flow.use('Sync').should.have.property('lastSync');
		stub.flow.use('Sync').should.have.property('lastSyncAll');
		stub.flow.use('Sync').should.have.property('standby');
	});
	it('intervalSyncAll、intervalSyncChunk、intervalSyncNote、intervalSyncTag属性を持つ。', function() {
		stub.flow.use('Sync').should.have.property('intervalSyncAll', 15 * 60 * 1000);
		stub.flow.use('Sync').should.have.property('intervalSyncChunk', 60 * 1000);
		stub.flow.use('Sync').should.have.property('intervalSyncNote', 1000);
		stub.flow.use('Sync').should.have.property('intervalSyncTag', 1000);
	});
	it('Syncコンポーネントは別々の変数に代入しても同一の参照となる。', function() {
		var sync = stub.flow.use('Sync');
		var sync2 = stub.flow.use('Sync');
		sync.should.have.property('USN', null);
		sync2.should.have.property('USN', null);
		sync.USN = 334;
		sync.should.have.property('USN', 334);
		sync2.should.have.property('USN', 334);
	});
	it('LoadConfigフローModelステップ時に再生成される。', function(done) {
		var sync = stub.flow.use('Sync');
		sync.test = 'TestValue!';
		sync.intervalSyncAll = 10;
		EventEmitter.listenerCount(stub.app, 'Model.LoadConfig').should.eql(1);
		stub.flow.next = function() {
			var sync = stub.flow.use('Sync');
			sync.should.not.have.property('test');
			sync.intervalSyncAll.should.eql(15 * 60 * 1000);
			done();
		};
		stub.app.emit('Model.LoadConfig', stub.flow);
	});
	it('LoadConfigフローViewステップ時にdoSyncメソッドを動作させる。', function(done) {
		var sync = stub.flow.use('Sync');
		sync._lock.should.eql(false);
		stub.flow.next = function() {
			setTimeout(function() {
				sync._lock.should.eql(true);
				done();
			}, 10);
		};
		stub.app.emit('View.LoadConfig', stub.flow);
	});
	describe('#lock(message)', function() {
		it('同期処理のロックを取得する。取得に成功した場合はtrueを返す。', function() {
			var sync = stub.flow.use('Sync');
			sync.lock('Test').should.eql(true);
		});
		it('ロックが既に取得済みの場合はfalseを返す。', function() {
			var sync = stub.flow.use('Sync');
			sync.lock('Test').should.eql(true);
			sync.lock('Test').should.eql(false);
		});
		it('ロック中にはロック時に指定したmessageがmessage属性に入る。', function() {
			var sync = stub.flow.use('Sync');
			sync.lock('Test').should.eql(true);
			sync.message.should.eql('Test');
		});
		it('ロック取得失敗時にはmessageは更新されない。', function() {
			var sync = stub.flow.use('Sync');
			sync.lock('Test1').should.eql(true);
			sync.lock('Test2').should.eql(false);
			sync.message.should.eql('Test1');
		});
	});
	describe('#unlock()', function() {
		it('同期処理のロックを開放する。', function() {
			var sync = stub.flow.use('Sync');
			// 実際にはアンロック直後に走るイベントで再度ロックされるため、リスナを消去する。
			sync.removeAllListeners('unlock');
			sync.lock('Test').should.eql(true);
			sync.unlock();
			sync.lock('Test').should.eql(true);
		});
		it('解放後はmessage属性がnullになる。', function() {
			var sync = stub.flow.use('Sync');
			sync.removeAllListeners('unlock');
			sync.lock('Test').should.eql(true);
			sync.message.should.eql('Test');
			sync.unlock();
			sync.should.have.property('message', null);
		});
		it('ロック開放時にはunlockイベントを発行する。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.removeAllListeners('unlock');
			sync.on('unlock', function() {
				done();
			});
			sync.lock('Test').should.eql(true);
			sync.unlock();
		});
		it('ロックされていない場合はunlockイベントは発行されない。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.removeAllListeners('unlock');
			sync.on('unlock', function() {
				throw new Error('Event unlock should not be called.');
			});
			setTimeout(function() {
				done();
			}, 5);
			sync.unlock();
		});
	});
	describe('#noteList', function() {
		it('ノート同期のリストを保持する。', function() {
			var sync = stub.flow.use('Sync');
			sync.should.have.property('noteList');
		});
		describe('#add(key, body)', function() {
			it('ノート同期リストに追加する。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test', 'Test Title');
				sync.noteList._list.should.have.property('Test', 'Test Title');
			});
			it('リストには複数のノートを追加することができる。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test1', 'Test Title');
				sync.noteList.add('Test2', 'Test Title');
				sync.noteList.add('Test3', 'Test Title');
				sync.noteList.add('Test4', 'Test Title');
				sync.noteList.add('Test5', 'Test Title');
				sync.noteList.add('Test6', 'Test Title');
				sync.noteList._list.should.have.keys('Test1', 'Test2', 'Test3', 'Test4', 'Test5', 'Test6');
				sync.noteList.count().should.eql(6);
			});
			it('同じキーでaddを行った場合は追加されず、既存アイテムが更新される。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test', 'Test Title');
				sync.noteList._list.should.have.property('Test', 'Test Title');
				sync.noteList.count().should.eql(1);
				sync.noteList.add('Test', 'Test Title2');
				sync.noteList._list.should.have.property('Test', 'Test Title2');
				sync.noteList.count().should.eql(1);
			});
			it('キー名をundefinedなど、falseとして扱われるもので指定した場合、リストは追加されない。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add(undefined, 'Test Title');
				sync.noteList.count().should.eql(0);
				sync.noteList.add('', 'Test Title');
				sync.noteList.count().should.eql(0);
				sync.noteList.add(0, 'Test Title');
				sync.noteList.count().should.eql(0);
				sync.noteList.add(false, 'Test Title');
				sync.noteList.count().should.eql(0);
			});
			it('値はundefinedでも追加される。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test1', undefined);
				sync.noteList.count().should.eql(1);
				sync.noteList.add('Test2', '');
				sync.noteList.count().should.eql(2);
				sync.noteList.add('Test3', null);
				sync.noteList.count().should.eql(3);
			});
		});
		describe('#remove(key)', function() {
			it('指定したキーのアイテムを削除する。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test', 'Test Title');
				sync.noteList._list.should.have.property('Test', 'Test Title');
				sync.noteList.count().should.eql(1);
				sync.noteList.remove('Test');
				sync.noteList._list.should.not.have.property('Test');
				sync.noteList.count().should.eql(0);
			});
			it('存在しないキーを指定しても特に何も起こらない。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.count().should.eql(0);
				sync.noteList.remove('Test');
				sync.noteList._list.should.not.have.property('Test');
				sync.noteList.count().should.eql(0);
			});
		});
		describe('#get()', function() {
			it('リストからアイテムを一つ取得する。戻り値は{key: key, body: body}の形式になる。順番は特に保証しない。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test', 'Test Title');
				var item = sync.noteList.get();
				item.should.have.property('key', 'Test');
				item.should.have.property('body', 'Test Title');
				sync.noteList.count().should.eql(1);
			});
			it('リストが空の時はundefinedとなる。', function() {
				var sync = stub.flow.use('Sync');
				var item = sync.noteList.get();
				(item === undefined).should.eql(true);
			});
		});
		describe('#all()', function() {
			it('リスト内の全てのアイテムを取得する。getで取得する形式の配列となる。', function() {
				var sync = stub.flow.use('Sync');
				sync.noteList.add('Test1', 'Test Title1');
				sync.noteList.add('Test2', 'Test Title2');
				sync.noteList.add('Test3', 'Test Title3');
				sync.noteList.add('Test4', 'Test Title4');
				var items = sync.noteList.all();
				items.should.be.an.instanceOf(Array);
				items.should.length(4);
				items[0].should.have.property('key', 'Test1');
				items[0].should.have.property('body', 'Test Title1');
				items[1].should.have.property('key', 'Test2');
				items[1].should.have.property('body', 'Test Title2');
			});
			it('リストが空の時は空の配列となる。', function() {
				var sync = stub.flow.use('Sync');
				var item = sync.noteList.all();
				item.should.length(0);
			});
		});
		describe('#count()', function() {
			it('リスト内にあるアイテムの数を返す。', function() {
				// 各パターンのテストは他のメソッド内のテスト依存。
				var sync = stub.flow.use('Sync');
				sync.noteList.count().should.eql(0);
			});
		});
	});
	describe('#tagList', function() {
		it('同期するタグのリストを保持する。', function() {
			var sync = stub.flow.use('Sync');
			sync.should.have.property('tagList');
		});
		it('noteListと同じ型で、仕様も同じである。', function() {
			var sync = stub.flow.use('Sync');
			sync.tagList.should.be.instanceOf(sync.noteList.constructor);
		});
	});
	describe('#errorList', function() {
		it('同期エラーのリストを保持する。', function() {
			var sync = stub.flow.use('Sync');
			sync.should.have.property('errorList');
		});
		it('noteListと同じ型で、仕様も同じである。', function() {
			var sync = stub.flow.use('Sync');
			sync.errorList.should.be.instanceOf(sync.noteList.constructor);
		});
	});
	describe('#doSyncAll()', function() {
		it('完全同期(BatchSyncAll)フローを実行する。', function(done) {
			var sync = stub.flow.use('Sync');
			stub.app.once('BatchSyncAll', function() {
				done();
			});
			sync.doSyncAll();
		});
		it('ロックがかかっている場合、ロックを横取りし、unlock時に実行するため、stanby属性に代入する。', function(done) {
			var sync = stub.flow.use('Sync');
			stub.app.once('BatchSyncAll', function() {
				done();
			});
			(sync.standby === null).should.eql(true);
			sync.lock('Test');
			sync.doSyncAll();
			sync.standby.should.be.type('function');
			sync.message.should.not.eql('Test');
			sync.standby();
		});
		it('前回実行時(lastSyncAll)からintervalSyncAll(ミリ秒、初期15分)以内の場合は同期しない。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			stub.app.once('BatchSyncAll', function() {
				throw new Error('Flow BatchSyncAll should not be called.');
			});
			sync.doSyncAll();
			setTimeout(function() {
				done();
			}, 5);
		});
		it('intervalSyncAllの値を変更すると同期禁止期間を操作できる。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			sync.intervalSyncAll = 14 * 60 * 1000;
			stub.app.once('BatchSyncAll', function() {
				done();
			});
			sync.doSyncAll();
		});
		it('前回実行時(lastSyncAll)から15分以内に実行した場合、BatchSyncAllのキーでエラーが追加される。', function() {
			var sync = stub.flow.use('Sync');
			sync.lastSyncAll = new Date((new Date()) - 15 * 60 * 1000 + 1000);
			sync.doSyncAll();
			sync.errorList.count().should.eql(1);
			var error = sync.errorList.get();
			error.should.have.property('key', 'BatchSyncAll');
		});
	});
	describe('#doSync()', function() {
		it('このメソッドは初期状態でunlockイベントにバインドされている', function() {
			var sync = stub.flow.use('Sync');
			sync.listeners('unlock')[0].should.be.eql(sync.doSync);
		});
		it('standby属性に代入された処理を実行する。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.standby = done;
			sync.doSync();
		});
		it('standby処理実行後はstandby属性がnullになる。', function() {
			var sync = stub.flow.use('Sync');
			var checkStandby = false;
			sync.standby = function() {
				checkStandby = true;
			};
			sync.doSync();
			checkStandby.should.eql(true);
			(sync.standby === null).should.eql(true);
		});
		it('standby属性が空の場合、状況に合わせてstanby属性を設定する。ノートリスト、タグリストが空の場合はBatchSyncChunkフローを設定する。', function(done) {
			var sync = stub.flow.use('Sync');
			stub.app.once('BatchSyncChunk', function() {
				done();
			});
			(sync.standby === null).should.eql(true);
			sync.doSync();
			sync.standby.should.be.type('function');
			sync.doSync();
		});
		it('BatchSyncChunk設定時はロックを取得し、intervalSyncChunk属性の値(ミリ秒)後にアンロックする。', function(done) {
			var sync = stub.flow.use('Sync');
			var checkLock = false;
			stub.app.once('BatchSyncChunk', function() {
				checkLock.should.eql(true);
				done();
			});
			sync.intervalSyncChunk = 15;
			(sync.standby === null).should.eql(true);
			sync.doSync();
			sync.standby.should.be.type('function');
			setTimeout(function() {
				checkLock = !sync.lock('test');
			}, 10);
		});
		it('BatchSyncChunk設定時にロック取得失敗した場合、何もしない。', function() {
			var sync = stub.flow.use('Sync');
			sync.lock('Test');
			(sync.standby === null).should.eql(true);
			sync.doSync();
			(sync.standby === null).should.eql(true);
		});
		it('ノートリストにアイテムがある場合はBatchSyncNoteを設定する。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.noteList.add('test', 'testnote');
			stub.app.once('BatchSyncNote', function() {
				done();
			});
			(sync.standby === null).should.eql(true);
			sync.doSync();
			sync.standby.should.be.type('function');
			sync.doSync();
		});
		it('BatchSyncNote設定時はロックを取得し、intervalSyncNote属性の値(ミリ秒)後にアンロックする。', function(done) {
			var sync = stub.flow.use('Sync');
			sync.noteList.add('test', 'testnote');
			var checkLock = false;
			stub.app.once('BatchSyncNote', function() {
				checkLock.should.eql(true);
				done();
			});
			sync.intervalSyncNote = 10;
			(sync.standby === null).should.eql(true);
			sync.doSync();
			sync.standby.should.be.type('function');
			setTimeout(function() {
				checkLock = !sync.lock('test');
			}, 5);
		});
		it('BatchSyncNote設定時にロック取得失敗した場合、何もしない。', function() {
			var sync = stub.flow.use('Sync');
			sync.noteList.add('test', 'testnote');
			sync.lock('Test');
			(sync.standby === null).should.eql(true);
			sync.doSync();
			(sync.standby === null).should.eql(true);
		});
		it('ノートリストが空でタグリストにアイテムがある場合はBatchSyncTagを設定する。>未実装');
	});
	describe('#resetInterval()', function() {
		it('intervalSyncAll、intervalSyncChunk、intervalSyncNote、intervalSyncTag属性を初期値に戻す。', function() {
			var sync = stub.flow.use('Sync');
			sync.intervalSyncAll = 80;
			sync.intervalSyncChunk = 6;
			sync.intervalSyncNote = 9;
			sync.intervalSyncTag = 5;
			sync.resetInterval();
			sync.should.have.property('intervalSyncAll', 15 * 60 * 1000);
			sync.should.have.property('intervalSyncChunk', 60 * 1000);
			sync.should.have.property('intervalSyncNote', 1000);
			sync.should.have.property('intervalSyncTag', 1000);
		});
	});
});
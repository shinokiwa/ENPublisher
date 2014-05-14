var com, Com = require('../../../app/components/evernote.js');
var Evernote = require('../../stub/evernoteStub.js');
var stub, Stub = require('../../stub/index.js');

describe('Components.evernote', function() {
	beforeEach(function(done) {
		stub = Stub();
		com = Com(stub.app, Evernote);
		stub.flow.locals.configure = {
			evernote : {
				"token" : "TEST-TOKEN",
				"notebookGuid" : "COLLECT-NOTEBOOK",
				"publishedGuid" : "TEST-PUBLISEHD-GUID",
				"sandbox" : false
			}
		};
		stub.flow.next = function() {
			done();
			delete (stub.flow.locals.configure);
			stub.flow.next = function() {
			};
		};
		stub.app.emit('Model.LoadConfig', stub.flow);
	});
	it('Evernoteコンポーネントの実体を取得する。', function() {
		var evernote = com();
		evernote.should.be.type('object');
	});
	it('EvernoteコンポーネントはEvernoteSDKのClientの実体を_client属性に持つ。', function() {
		var evernote = com();
		evernote.should.have.property('_client');
		evernote._client.should.be.instanceOf(Evernote.Evernote.Client);
	});
	it('_client属性にはLoadConfigフローでセットされたトークンが保持されている。', function() {
		var evernote = com();
		evernote._client.should.have.property('token', 'TEST-TOKEN');
	});
	describe('#getMetaAll(offset, next)', function() {
		it('対象のノートブックのメタ情報を一度に100件取得する。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('findNotesMetadata', function(input, output) {
				input.noteFilter.notebookGuid.should.eql('COLLECT-NOTEBOOK');
				check = true;
				output.push(1000);
			});
			evernote.getMetaAll(0, function(err, data) {
				check.should.be.ok;
				data.should.have.property('notes');
				data.notes.length.should.eql(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-0');
				done();
			});
		});
		it('offsetの指定だけオフセットをかける。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('findNotesMetadata', function(input, output) {
				input.offset.should.eql(100);
				check = true;
				output.push(1000);
			});
			evernote.getMetaAll(100, function(err, data) {
				check.should.be.ok;
				data.should.have.property('notes').and.length(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-100');
				done();
			});
		});
	});
	describe('#getSyncChunk(usn, next)', function() {
		it('USNに対する差分を取得する。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('getFilteredSyncChunk', function(input, output) {
				input.usn.should.eql(45);
				check = true;
				output.push(1000);
			});
			evernote.getSyncChunk(45, function(err, data) {
				check.should.be.ok;
				data.should.have.property('notes').and.length(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-0');
				done();
			});
		});
	});
	describe('#getSyncState(next)', function() {
		it('同期ステータスを取得する。EvernoteAPIのgetSyncStateそのまま。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.getSyncState = function(next) {
				check = true;
				next();
			};
			evernote.getSyncState(function(err, data) {
				check.should.be.ok;
				done();
			});
		});
	});
	describe('#getNote(guid, next)', function() {
		it('guidで指定したノートを取得してコールバックに与える。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			evernote.getNote('TEST-NOTE', function(err, data) {
				check.should.be.ok;
				data.should.have.property('guid', 'TEST-NOTE');
				done();
			});
		});
		it('ノートが存在しない場合はコールバックにnullを渡す。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			evernote.getNote('NOTHING-NOTE', function(err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});
		it('deletedが付与されている場合はコールバックにnullを渡す。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			evernote.getNote('DELETED-NOTE', function(err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});
		it('ノートブックが公開指定のノートでない場合はコールバックにnullを渡す。', function(done) {
			var evernote = com();
			var check = false;
			evernote._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			evernote.getNote('OTHER-NOTEBOOK', function(err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});

	});
});
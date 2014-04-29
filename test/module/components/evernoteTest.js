var module = require('../../../app/components/evernote.js');
var Evernote = require ('../../stub/evernoteStub.js');
var com;
var clear = function () {
	com = module(Evernote, 'TEST-TOKEN', 'COLLECT-NOTEBOOK', 'PUBLISHED-GUID')();
};

describe('components.evernote', function() {
	describe('#create', function () {
		it('Evernoteコンポーネントの実体を取得する。', function () {
			clear();
			com.should.be.type('object');
		});
	});
	describe('#getMetaAll(offset, next)', function () {
		it('対象のノートブックのメタ情報を一度に100件取得する。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('findNotesMetadata', function(input, output) {
				input.noteFilter.notebookGuid.should.eql('COLLECT-NOTEBOOK');
				check = true;
				output.push(1000);
			});
			com.getMetaAll(0, function (err, data) {
				check.should.be.ok;
				data.should.have.property('notes');
				data.notes.length.should.eql(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-0');
				done();
			});
		});
		it('offsetの指定だけオフセットをかける。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('findNotesMetadata', function(input, output) {
				input.offset.should.eql(100);
				check = true;
				output.push(1000);
			});
			com.getMetaAll(100, function (err, data) {
				check.should.be.ok;
				data.should.have.property('notes').with.length(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-100');
				done();
			});
		});
	});
	describe('#getSyncChunk(usn, next)', function () {
		it('USNに対する差分を取得する。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('getFilteredSyncChunk', function(input, output) {
				input.usn.should.eql(45);
				check = true;
				output.push(1000);
			});
			com.getSyncChunk(45, function (err, data) {
				check.should.be.ok;
				data.should.have.property('notes').with.length(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-0');
				done();
			});
		});
	});
	describe('#getSyncState(next)', function () {
		it('同期ステータスを取得する。EvernoteAPIのgetSyncStateそのまま。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.getSyncState = function (next) {
				check = true;
				next();
			};
			com.getSyncState(function (err, data) {
				check.should.be.ok;
				done();
			});
		});
	});
	describe('#getNote(guid, next)', function () {
		it('guidで指定したノートを取得してコールバックに与える。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			com.getNote('TEST-NOTE', function (err, data) {
				check.should.be.ok;
				data.should.have.property('guid', 'TEST-NOTE');
				done();
			});
		});
		it('ノートが存在しない場合はコールバックにnullを渡す。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			com.getNote('NOTHING-NOTE', function (err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});
		it('deletedが付与されている場合はコールバックにnullを渡す。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			com.getNote('DELETED-NOTE', function (err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});
		it('ノートブックが公開指定のノートでない場合はコールバックにnullを渡す。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.on('getNote', function(input, output) {
				check = true;
			});
			com.getNote('OTHER-NOTEBOOK', function (err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});
		
	});
});
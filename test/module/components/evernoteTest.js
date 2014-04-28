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
			com._client._noteStore.preFindNotesMetadata = function(noteFilter, offset, max, notesMetadataResultSpec, next) {
				noteFilter.notebookGuid.should.eql('COLLECT-NOTEBOOK');
				check = true;
				next(1000);
			};
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
			com._client._noteStore.preFindNotesMetadata = function(noteFilter, offset, max, notesMetadataResultSpec, next) {
				offset.should.eql(100);
				check = true;
				next(1000);
			};
			com.getMetaAll(100, function (err, data) {
				check.should.be.ok;
				data.should.have.property('notes');
				data.notes.length.should.eql(100);
				data.notes[0].should.have.property('guid', 'TEST-GUID-100');
				done();
			});
		});
	});
	describe('#getNote(guid, next)', function () {
		it('guidで指定したノートを取得してコールバックに与える。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.preGetNote = function(guid, next) {
				check = true;
				next();
			};
			com.getNote('TEST-NOTE', function (err, data) {
				check.should.be.ok;
				data.should.have.property('guid', 'TEST-NOTE');
				done();
			});
		});
		it('ノートが存在しない場合はコールバックにnullを渡す。', function (done) {
			clear();
			var check = false;
			com._client._noteStore.preGetNote = function(guid, next) {
				check = true;
				next();
			};
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
			com._client._noteStore.preGetNote = function(guid, next) {
				check = true;
				next();
			};
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
			com._client._noteStore.preGetNote = function(guid, next) {
				check = true;
				next();
			};
			com.getNote('OTHER-NOTEBOOK', function (err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				(data == null).should.be.ok;
				done();
			});
		});
		
	});
});
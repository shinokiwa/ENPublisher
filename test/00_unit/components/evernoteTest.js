var sinon = require('sinon');
var chai = require('chai');
var should = chai.should(), expect = chai.expect;

var suite, flow, evernote;
var setup = require('../setup.js');
var Evernote = require ('evernote');

describe('Components.evernote', function() {
	beforeEach(function(done) {
		suite = setup();
		flow = suite.flow;
		evernote = flow.use('Evernote');
		suite.app.on('View.LoadConfig', function () {
			done();
		}).flow('LoadConfig')();
	});
	describe('#_client', function() {
		it('EvernoteSDKのClientの実体。基本的に外部からはアクセスしない。', function() {
			evernote.should.have.property('_client');
			evernote._client.should.be.instanceOf(Evernote.Evernote.Client);
		});
	});
	describe('#getMetaAll(offset, callback)', function() {
		it('対象のノートブックのメタ情報を一度に最大100件取得する。', function(done) {
			evernote.getMetaAll(0, function(err, data) {
				expect(data).to.have.property('notes');
				expect(data.notes.length).to.eql(100);
				expect(data.notes[0]).to.have.property('guid', 'TEST-NOTE-GUID-0');
				done();
			});
		});
		it('offsetの指定だけオフセットをかける。', function(done) {
			evernote.getMetaAll(100, function(err, data) {
				expect(data).to.have.property('startIndex', 100);
				expect(data).to.have.property('notes').and.length(100);
				expect(data.notes[0]).to.have.property('guid', 'TEST-NOTE-GUID-100');
				done();
			});
		});
	});
	describe('#getSyncChunk(usn, next)', function() {
		it('USNに対する差分を取得する。', function(done) {
			evernote.getSyncChunk(45, function(err, data) {
				expect(data).to.have.property('notes').and.length(100);
				expect(data.notes[0]).to.have.property('guid', 'TEST-NOTE-GUID-0');
				done();
			});
		});
	});
	describe('#getSyncState(next)', function() {
		it('同期ステータスを取得する。EvernoteAPIのgetSyncStateそのまま。', function(done) {
			evernote.getSyncState(function(err, data) {
				expect(data).to.have.property('updateCount');
				done();
			});
		});
	});
	describe('#getNote(guid, next)', function() {
		it('guidで指定したノートを取得してコールバックに与える。', function(done) {
			evernote.getNote('TEST-NOTE-GUID-0', function(err, data) {
				expect(err).to.eql(null);
				expect(data).to.have.property('guid', 'TEST-NOTE-GUID-0');
				done();
			});
		});
		it('ノートが存在しない場合はコールバックにundefinedを渡す。', function(done) {
			evernote.getNote('NOTHING-NOTE', function(err, data) {
				expect(err).to.eql(null);
				expect(data).to.eql(undefined);
				done();
			});
		});
		it('ノートブックが異なる場合はコールバックにnullを渡す。', function(done) {
			evernote.getNote('OTHER-NOTEBOOK', function(err, data) {
				expect(err).to.eql(null);
				expect(data).to.eql(null);
				done();
			});
		});
		it('deletedが付与されている場合はコールバックにnullを渡す。', function(done) {
			evernote.getNote('DELETED-NOTE', function(err, data) {
				expect(err).to.eql(null);
				expect(data).to.eql(null);
				done();
			});
		});
	});
});
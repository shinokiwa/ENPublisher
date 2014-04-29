var module = require('../../../app/components/post.js');
var mongoose = require('../../stub/mongooseComponent.js');
var Note = require('../../stub/evernoteData.js').Note;
var com;
var clear = function() {
	com = module(mongoose, 'PUBLISH-GUID')();
};
var checker = mongoose();
var Post = checker.model('Post');
describe('components.post', function() {
	describe('#create', function() {
		it('Postコンポーネントの実体を取得する。', function() {
			clear();
			com.should.be.type('object');
		});
	});
	describe('#getMetaAll(data, next)', function() {
		it('全ポストのメタ情報(GUIDとタイトル)を取得する。findを固定条件で実行するだけのもの。', function(done) {
			var check = false;
			var note2 = new Post({
				guid : 'TEST-GUID2',
				url: 'abc'
			});
			checker.once('Post.Find', function(input, output) {
				input.conditions.should.empty;
				input.fields.should.have.property('guid', true);
				input.fields.should.have.property('title', true);
				output.data = [note2];
				check = true;
			});
			com.getMetaAll(function(err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				data.should.length(1);
				done();
			});
		});
	});
	describe('#save(data, next)', function() {
		it('指定のノートを記事として保存する。GUIDが重複している場合は上書き保存される。', function(done) {
			var note = new Note('TEST-GUID');
			var check = false;
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				input.conditions.should.have.property('guid', 'TEST-GUID');
				input.update.should.have.property('guid', 'TEST-GUID');
				input.options.should.have.property('upsert', true);
				check = true;
			});
			com.save(note, function(err) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
		it('タイトルの左右の半角スペースおよびタブはトリムされる。', function(done) {
			var note = new Note('TEST-GUID');
			note.title = '	 TestTitle 	 ';
			var check = false;
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				input.update.should.have.property('title', 'TestTitle');
				check = true;
			});
			com.save(note, function(err) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
		it('タイトルの#以降がURLとして扱われる。その際、タイトルは#までが使用される。', function(done) {
			var note = new Note('TEST-GUID');
			note.title = 'TestTitle # testURL/abc';
			var check = false;
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				input.update.should.have.property('title', 'TestTitle');
				input.update.should.have.property('url', 'testURL/abc');
				check = true;
			});
			com.save(note, function(err) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
		it('タイトルに#が含まれていない場合、URLはタイトルをURLエンコードしたものになる。', function(done) {
			var note = new Note('TEST-GUID');
			note.title = 'TestTitle/abc';
			var check = false;
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				input.update.should.have.property('title', 'TestTitle/abc');
				input.update.should.have.property('url', 'TestTitle%2Fabc');
				check = true;
			});
			com.save(note, function(err) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
		it('URLはユニークであり、重複するとエラーになる。', function(done) {
			var note1 = new Note('TEST-GUID1');
			note1.title = 'Test1#abc';
			var note2 = new Post({
				guid : 'TEST-GUID2',
				url: 'abc'
			});
			var check1 = false;
			var check2 = false;
			checker.once('Post.FindOne', function(input, output) {
				input.conditions.should.have.property('url', 'abc');
				output.data = note2;
				check1 = true;
			});
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				check2 = true;
			});
			com.save(note1, function(err) {
				check1.should.be.ok;
				check2.should.be.ng;
				(err != null).should.be.ok;
				err.should.have.property('message', 'Duplicate URL.');
				done();
			});
		});
		it('URLが重複していても、GUIDが同じであれば上書きされる。', function(done) {
			var note1 = new Note('TEST-GUID');
			note1.title = 'Test1#abc';
			var note2 = new Post({
				guid : 'TEST-GUID',
				title: 'Tset2',
				url: 'abc'
			});
			var check1 = false;
			var check2 = false;
			checker.once('Post.FindOne', function(input, output) {
				input.conditions.should.have.property('url', 'abc');
				output.data = note2;
				check1 = true;
			});
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				check2 = true;
			});
			com.save(note1, function(err) {
				check1.should.be.ok;
				check2.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
		it('published指定のタグが付与されていない場合はviewがfalse、publishedがnullになる。', function(done) {
			var note = new Note('TEST-GUID');
			note.tagGuids = new Array();
			var check = false;
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				input.update.should.have.property('view', false);
				input.update.should.have.property('published', null);
				check = true;
			});
			com.save(note, function(err) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
		it('published指定のタグが付与されている場合はviewがtrue、publishedが同期した時刻になる。', function(done) {
			var note = new Note('TEST-GUID');
			var check = false;
			checker.once('Post.FindOneAndUpdate', function(input, output) {
				input.update.should.have.property('view', true);
				input.update.published.should.be.a.Date;
				check = true;
			});
			com.save(note, function(err) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
	});
	describe('#remove(conditions, next)', function() {
		it('mongooseのPost.removeをそのまま実行する。', function(done) {
			var check = false;
			checker.once('Post.Remove', function(input, output) {
				input.conditions.should.have.property('guid', 'TEST-GUID');
				check = true;
			});
			com.remove({guid: 'TEST-GUID'}, function(err, data) {
				check.should.be.ok;
				(err == null).should.be.ok;
				done();
			});
		});
	});
});
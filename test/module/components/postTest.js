var module = require('../../../app/components/post.js');
var mongoose = require ('../../stub/mongooseComponent.js');
var Note = require ('../../stub/evernoteData.js').Note;
var com;
var clear = function () {
	com = module(mongoose, 'PUBLISHED-GUID')();
};

describe('components.post', function() {
	describe('#create', function () {
		it('Evernoteコンポーネントの実体を取得する。', function () {
			clear();
			com.should.be.type('object');
		});
	});
	describe('#getMetaAll(data, next)', function() {
		
	});
	describe('#save(data, next)', function() {
		it('指定のノートを記事として保存する。', function (done) {
			var note = new Note ('TEST-GUID');
			// nextに渡しているdataはスタブ特別の引数で実際には存在しない。
			com.save(note, function (err, data) {
				data.should.have.property('guid', 'TEST-GUID');
				(!err).should.be.ok;
				done();
			});
		});
		it('タイトルの#以降がURLとして扱われる。その際、タイトルは#までが使用される。');
		it('タイトルに#が含まれていない場合、URLはタイトルをURLエンコードしたものになる。');
		it('GUIDが重複している場合、上書き保存される。');
		it('URLはユニークであり、重複するとエラーになる。');
		it('URLが重複していても、GUIDが同じであれば上書きされる。');
		it('published指定のタグが付与されていない場合はisPublishedがfalse、publishedがnullになる。');
		it('published指定のタグが付与されている場合はisPublishedがtrue、publishedが同期した時刻になる。');
	});
	describe('#remove(data, next)', function() {
		
	});
});
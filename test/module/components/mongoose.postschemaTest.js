var com = require('../../../app/components/mongooses/postSchema.js');
require('should');
// DBには接続しないため、mongooseと結合状態でテストする。
var db = require('mongoose');
db.model('Post', com);
var Post = db.model('Post');

describe('components.mongoose.postschema', function() {
	describe('#Schema', function() {
		it('Postスキーマを取得できる。', function() {
			Post.should.be.type('function');
			var post = new Post();
			post.should.be.type('object');
		});
		it('Postスキーマのインスタンスはguid、title、url、content、created、updated、published、viewをプロパティに持つ。初期値は全てnull。', function() {
			var post = new Post();
			post.should.have.property('guid', null);
			post.should.have.property('title', null);
			post.should.have.property('url', null);
			post.should.have.property('content', null);
			post.should.have.property('created', null);
			post.should.have.property('updated', null);
			post.should.have.property('published', null);
			post.should.have.property('view', null);
		});
		it('_idは持たない。', function() {
			var post = new Post();
			post.should.not.have.property('_id');
		});
		it('guidとurlはユニークインデックスになっている。');
	});
	describe('#title', function() {
		it('titleに値をセットすると、titleとurlが自動的に作成される。');
		it('title、urlの左右の半角スペースおよびタブはトリムされる。');
		it('urlはURLエンコード(encodeURIComponent)される。');
	});
	describe('#contentHTML', function() {
		var post = new Post();
		post.guid = 'TEST-GUID';
		var contentBase = '<?xml version="1.0" encoding="UTF-8"?>' + "\n" + '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">' + "\n" + '<en-note>__CONTENT__</en-note>';
		it('PostスキーマはcontentHTMLの仮想属性を持つ。', function() {
			post.should.have.property('contentHTML');
		});
		it('contentHTMLはcontentのen-note要素を整形したものが入る。en-note自体は含めない。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div>TestNote!</div>');
			var contentHTML = '<div>TestNote!</div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('<br />は属性を含めて変化しない。', function() {
			var contentHTML = '<div><br clear="none"/></div><div><br clear="both"/></div><div><br/></div>';
			post.content = contentBase.replace('__CONTENT__', contentHTML);
			post.contentHTML.should.eql(contentHTML);
		});
		it('en-mediaはtype属性に従って置き換えられる。type属性自体は除去される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/><en-media hash="test-hash" type="image/png"></en-media></div>');
			var contentHTML = '<div><br clear="none"/><img src="/files/TEST-GUID/test-hash.png"/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('type=image/png、image/jpg、image/jpeg、image/gifはimgに置き換えられる。files/[noteGUID]/のパス、mimeの/以降が拡張子としてsrcに付与される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/><en-media hash="test-hash" type="image/png"></en-media></div>');
			var contentHTML = '<div><br clear="none"/><img src="/files/TEST-GUID/test-hash.png"/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('それ以外のtypeはaに置き換えられる。files/[noteGUID]/のパス、mimeの/以降が拡張子としてhrefに付与される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/><en-media hash="test-hash" type="application/pdf"></en-media></div>');
			var contentHTML = '<div><br clear="none"/><a href="/files/TEST-GUID/test-hash.pdf"/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('en-cryptは除去される。その際、空になったdivがあれば除去される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/></div><div><en-crypt></en-crypt></div><div><br/></div>');
			var contentHTML = '<div><br clear="none"/></div><div><br/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('en-todoは除去される。その際、空になったdivがあれば除去される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/></div><div><en-todo></en-todo></div><div><br/></div>');
			var contentHTML = '<div><br clear="none"/></div><div><br/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('aのリンク先がevernoteプロトコルで指定されている場合、/id/[guid]に変換される。');
		it('aのリンク先が外部サイトの場合、target="_blank"が付与される。');
		it('aがen-mediaを変換したものである場合、');
		it('[literal][/literal]の間はテキスト要素をHTML特殊文字を戻したもののみが使用される。');
	});
});
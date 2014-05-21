var com = require('../../../app/components/mongooses/postSchema.js');
require('should');
// DBには接続しないため、mongooseと結合状態でテストする。
var db = require('mongoose');
db.model('Post', com);
var Post = db.model('Post');

describe('components/mongoose/postSchema', function() {
	describe('#Schema', function() {
		it('Postスキーマを取得できる。', function() {
			Post.should.be.type('function');
			var post = new Post();
			post.should.be.type('object');
		});
		it('Postスキーマのインスタンスはguid、title、url、content、created、updated、publishedをプロパティに持つ。初期値は全てnull。', function() {
			var post = new Post();
			post.should.have.property('guid', null);
			post.should.have.property('title', null);
			post.should.have.property('url', null);
			post.should.have.property('content', null);
			post.should.have.property('created', null);
			post.should.have.property('updated', null);
			post.should.have.property('published', null);
		});
		it('guidとurlはユニークインデックスになっている。');
	});
	describe('#title', function() {
		it('タイトルの左右の半角スペースおよびタブはトリムされる。', function() {
			var post = new Post();
			post.title = '	 TestTitle 	 ';
			post.title.should.eql('TestTitle');
		});
		it('タイトルの#以降がURLとして扱われる。その際、タイトルは#までが使用される。', function() {
			var post = new Post();
			post.title = 'TestTitle # testURL/abc';
			post.should.have.property('title', 'TestTitle');
			post.should.have.property('url', 'testURL/abc');
		});
		it('タイトルに#が含まれていない場合、URLはタイトルをURLエンコード(encodeURIComponent)したものになる。', function() {
			var post = new Post();
			post.title = 'TestTitle/abc';
			post.should.have.property('title', 'TestTitle/abc');
			post.should.have.property('url', 'TestTitle%2Fabc');
		});
	});
	describe('#url', function() {
		it('urlの左右の半角スペースおよびタブはトリムされる。', function() {
			var post = new Post();
			post.url = '	 TestTitle 	 ';
			post.url.should.eql('TestTitle');
		});
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
			var contentHTML = '<div><br clear="none"/><img src="/resources/TEST-GUID/test-hash.png"/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('type=image/png、image/jpg、image/jpeg、image/gifはimgに置き換えられる。files/[noteGUID]/のパス、mimeの/以降が拡張子としてsrcに付与される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/><en-media hash="test-hash" type="image/png"></en-media></div>');
			var contentHTML = '<div><br clear="none"/><img src="/resources/TEST-GUID/test-hash.png"/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('それ以外のtypeはaに置き換えられる。files/[noteGUID]/のパス、mimeの/以降が拡張子としてhrefに付与される。', function() {
			post.content = contentBase.replace('__CONTENT__', '<div><br clear="none"/><en-media hash="test-hash" type="application/pdf"></en-media></div>');
			var contentHTML = '<div><br clear="none"/><a href="/resources/TEST-GUID/test-hash.pdf"/></div>';
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
		it('aのリンク先がevernoteプロトコルで指定されている場合、/id/[guid]に変換される。', function () {
			post.content = contentBase.replace('__CONTENT__', '<div><a href="evernote:///view/4348674/s40/66234cce-7dbf-46b3-90e5-58e6cfe92f5d/66234cce-7dbf-46b3-90e5-58e6cfe92f5d/">TEST-NOTE</a></div><div><br/></div>');
			var contentHTML = '<div><a href="/id/66234cce-7dbf-46b3-90e5-58e6cfe92f5d">TEST-NOTE</a></div><div><br/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('aのリンク先が外部サイトの場合、target="_blank"が付与される。', function () {
			Post.setSiteDomain('localhost');
			post.content = contentBase.replace('__CONTENT__', '<div><a href="http://www.google.co.jp/">Google</a></div><div><br/></div>');
			var contentHTML = '<div><a href="http://www.google.co.jp/" target="_blank">Google</a></div><div><br/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('aのリンク先が同一ドメインの場合は何もしない。', function () {
			Post.setSiteDomain('localhost');
			post.content = contentBase.replace('__CONTENT__', '<div><a href="http://localhost/">LocalHost</a></div><div><br/></div>');
			var contentHTML = '<div><a href="http://localhost/">LocalHost</a></div><div><br/></div>';
			post.contentHTML.should.eql(contentHTML);
		});
		it('[literal][/literal]の間はテキスト要素をHTML特殊文字を戻したもののみが使用される。');
	});
	describe('#setPublished', function() {
		it('公開指定のタグGUIDを設定する。', function() {
			Post.setPublished('test');
		});
	});
	describe('#published()', function() {
		it('公開記事を取得するクエリを発行する。', function() {
			Post.setPublished('test');
			var query = Post.published();
			query._conditions.should.have.property('tags');
			query._conditions.tags.should.have.property('$elemMatch');
			query._conditions.tags.$elemMatch.should.have.property('guid', 'test');
		});
	});
});
var list,List = require ('../../../app/components/sync/list.js');
var chai = require ('chai');
chai.should();

describe('components/sync/list', function() {
	beforeEach (function () {
		list = new List();
	});
	it('リストを作成する。', function() {
		list.should.be.a('object');
	});
	describe('#add(key, body)', function() {
		it('リストに追加する。', function() {
			list.add('Test', 'Test Title');
			list._list.should.have.property('Test', 'Test Title');
		});
		it('項目追加は何度でもできる。', function() {
			list.add('Test1', 'Test Title');
			list.add('Test2', 'Test Title');
			list.add('Test3', 'Test Title');
			list.add('Test4', 'Test Title');
			list.add('Test5', 'Test Title');
			list.add('Test6', 'Test Title');
			list._list.should.have.keys('Test1', 'Test2', 'Test3', 'Test4', 'Test5', 'Test6');
			list.count().should.eql(6);
		});
		it('同じキーでaddを行った場合は追加されず、既存アイテムが更新される。', function() {
			list.add('Test', 'Test Title');
			list._list.should.have.property('Test', 'Test Title');
			list.count().should.eql(1);
			list.add('Test', 'Test Title2');
			list._list.should.have.property('Test', 'Test Title2');
			list.count().should.eql(1);
		});
		it('キー名をundefinedなど、falseとして扱われるもので指定した場合、リストは追加されない。', function() {
			list.add(undefined, 'Test Title');
			list.count().should.eql(0);
			list.add('', 'Test Title');
			list.count().should.eql(0);
			list.add(0, 'Test Title');
			list.count().should.eql(0);
			list.add(false, 'Test Title');
			list.count().should.eql(0);
		});
		it('値はundefinedでも追加される。', function() {
			list.add('Test1', undefined);
			list.count().should.eql(1);
			list.add('Test2', '');
			list.count().should.eql(2);
			list.add('Test3', null);
			list.count().should.eql(3);
		});
	});
	describe('#remove(key)', function() {
		it('指定したキーのアイテムを削除する。', function() {
			list.add('Test', 'Test Title');
			list._list.should.have.property('Test', 'Test Title');
			list.count().should.eql(1);
			list.remove('Test');
			list._list.should.not.have.property('Test');
			list.count().should.eql(0);
		});
		it('存在しないキーを指定しても特に何も起こらない。', function() {
			list.count().should.eql(0);
			list.remove('Test');
			list._list.should.not.have.property('Test');
			list.count().should.eql(0);
		});
	});
	describe('#get()', function() {
		it('リストからアイテムを一つ取得する。戻り値は{key: key, body: body}の形式になる。順番は特に保証しない。', function() {
			list.add('Test', 'Test Title');
			var item = list.get();
			item.should.have.property('key', 'Test');
			item.should.have.property('body', 'Test Title');
			list.count().should.eql(1);
		});
		it('リストが空の時はundefinedとなる。', function() {
			var item = list.get();
			(item === undefined).should.eql(true);
		});
	});
	describe('#all()', function() {
		it('リスト内の全てのアイテムを取得する。getで取得する形式の配列となる。', function() {
			list.add('Test1', 'Test Title1');
			list.add('Test2', 'Test Title2');
			list.add('Test3', 'Test Title3');
			list.add('Test4', 'Test Title4');
			var items = list.all();
			items.should.be.an.instanceOf(Array);
			items.should.length(4);
			items[0].should.have.property('key', 'Test1');
			items[0].should.have.property('body', 'Test Title1');
			items[1].should.have.property('key', 'Test2');
			items[1].should.have.property('body', 'Test Title2');
		});
		it('リストが空の時は空の配列となる。', function() {
			var item = list.all();
			item.should.length(0);
		});
	});
	describe('#count()', function() {
		it('リスト内にあるアイテムの数を返す。', function() {
			// 各パターンのテストは他のメソッド内のテスト依存。
			list.count().should.eql(0);
		});
	});
});

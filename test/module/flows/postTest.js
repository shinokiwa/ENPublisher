var flow = require('../../../app/flows/post.js');

var Input = require ('../../stub/input.js');
var input, db,output;
var clear = function () {
	input = new Input();
	db = input.components.database();
	output = {};
};


describe('flows.post', function() {
	describe('#controller', function() {
		it('urlパラメータから指定のポストurlを取得する。', function (done) {
			clear();
			var request = {
					params :{
						url : 'aaa'
					}
			};
			flow.controller(request, input, function () {
				input.should.have.property('valid', true);
				input.should.have.property('url', 'aaa');
				done();
			});
		});
		it('urlパラメータはURLエンコードされる。', function (done) {
			clear();
			var request = {
					params :{
						url : 'aaa/bbb'
					}
			};
			flow.controller(request, input, function () {
				input.should.have.property('valid', true);
				input.should.have.property('url', 'aaa%2Fbbb');
				done();
			});
		});
		it('urlパラメータがない時はInput.valid=falseとなる。', function (done) {
			clear();
			var request = {
					params :{
					}
			};
			flow.controller(request, input, function () {
				input.should.have.property('valid', false);
				input.should.not.have.property('url');
				done();
			});
		});
	});	
	describe('#model', function() {
		it('指定のURLで、view:trueとなっているポストを取得する。', function (done) {
			clear();
			var check1 = false;
			input.url = 'abc';
			input.valid = true;
			db.once('Post.findOne', function (input, output) {
				input.conditions.should.have.property('view', true);
				input.conditions.should.have.property('url', 'abc');
				output.data = {title: 'test!'};
				check1 = true;
			});
			flow.model(input, output, function () {
				output.should.have.property('post').with.have.property('title', 'test!');
				check1.should.be.ok;
				done();
			});
		});
		it('ポストが見つからない時はoutputにpostプロパティ自体入らない。', function (done) {
			clear();
			var check1 = false;
			input.url = 'abc';
			input.valid = true;
			db.once('Post.findOne', function (input, output) {
				input.conditions.should.have.property('view', true);
				input.conditions.should.have.property('url', 'abc');
				check1 = true;
			});
			flow.model(input, output, function () {
				output.should.not.have.property('post');
				check1.should.be.ok;
				done();
			});
		});
		it('input.valid=falseの時は何もしない。', function (done) {
			clear();
			var check1 = false;
			input.url = 'abc';
			input.valid = false;
			db.once('Post.findOne', function (input, output) {
				check1 = true;
			});
			flow.model(input, output, function () {
				output.should.not.have.property('post');
				check1.should.be.ng;
				done();
			});
		});
	});	
	describe('#model', function() {
		it('output.postが存在する時はpostテンプレートを表示する。', function (done) {
			clear();
			output.post = {title: 'test!'};
			var check1 = false;
			var response = {
				render: function (template, params) {
					template.should.eql('post');
					params.should.have.property('post').with.have.property('title', 'test!');
					check1 = true;
				}
			};
			flow.view(response, output, function () {
				check1.should.be.ok;
				done();
			});
		});
		it('output.postが存在しない時はerror404テンプレートを表示する。', function (done) {
			clear();
			var check1 = false;
			var check2 = false;
			var response = {
				render: function (template, params) {
					template.should.eql('error404');
					params.should.not.have.property('post');
					check1 = true;
				},
				status: function (status) {
					status.should.eql(404);
					check2 = true;
				}
			};
			flow.view(response, output, function () {
				check1.should.be.ok;
				check2.should.be.ok;
				done();
			});
		});
	});	
});
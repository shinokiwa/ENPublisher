var chai = require('chai');
var should = chai.should(), expect = chai.expect;

var setup = require('../setup.js');
var suite, flow, test;

describe('flows/FindId', function() {
	beforeEach(function(done) {
		suite = setup(function() {
			done();
		});
		flow = suite.flow;
		test = suite.require('flows/FindId.js');
	});
	describe('#Controller', function() {
		it('urlパラメータから指定のポストidを取得して、flow.locals.idに保持する。', function(done) {
			suite.request.params.id = 'aaaa';
			flow.next = function() {
				flow.locals.should.have.property('id', 'aaaa');
				done();
			};
			test.Controller(flow, suite.request, suite.response);
		});
		it('urlパラメータがない時はflow.locals.idは生成されない。', function(done) {
			suite.request.params.id = '';
			flow.next = function() {
				flow.locals.should.not.have.property('url');
				done();
			};
			test.Controller(flow, suite.request, suite.response);
		});
	});
	describe('#Model', function() {
		it('公開指定のポストをflow.locals.idで取得し、flow.locals.urlに保持する。', function(done) {
			var Post = flow.use('Database').model('Post');
			Post.setPublished('TEST-PUBLISHED-GUID');
			flow.locals.id = 'abc';
			Post.create({
				guid : 'abc',
				title : 'abc-note',
				tags : [ {
					guid : 'TEST-PUBLISHED-GUID'
				} ]
			}, function(err) {
				flow.next = function() {
					flow.locals.should.have.property('url', 'abc-note');
					done();
				};
				test.Model(flow, suite.request, suite.response);
			});
		});
		it('ポストが見つからない時は何もしない。', function(done) {
			flow.locals.id = 'aabbcc';
			flow.next = function() {
				flow.locals.should.not.have.property('url');
				done();
			};
			test.Model(flow, suite.request, suite.response);
		});
		it('flow.locals.urlがない時は何もしない。', function(done) {
			flow.next = function() {
				flow.locals.should.not.have.property('url');
				done();
			};
			test.Model(flow, suite.request, suite.response);
		});
	});
	describe('#View', function() {
		it('flow.locals.urlが存在する時は/post/[url]にリダイレクトする。', function(done) {
			flow.locals.url = 'aabbcc';
			var check = false;
			suite.response.redirect = function(status, url) {
				expect(status).to.eql(302);
				expect(url).to.eql('/post/aabbcc');
				check = true;
			};
			flow.next = function() {
				expect(check).to.eql(true);
				done();
			};
			test.View(flow, suite.request, suite.response);
		});
		it('flow.locals.urlが存在しない時はerror404テンプレートを表示する。', function(done) {
			var checkRender = false;
			var checkStatus = false;
			suite.response.render = function(template, params) {
				template.should.eql('error404');
				params.should.not.have.property('post');
				checkRender = true;
			};
			suite.response.status = function(errCode) {
				errCode.should.eql(404);
				checkStatus = true;
			};
			flow.next = function() {
				expect(checkRender).to.eql(true);
				expect(checkStatus).to.eql(true);
				done();
			};
			test.View(flow, suite.request, suite.response);
		});
	});
});
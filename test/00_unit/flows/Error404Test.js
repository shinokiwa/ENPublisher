var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
chai.should();
var nextFlow = lib.nextFlow;
var flow, app, request, response;

describe('flows/Error404', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.Error404();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('コントローラは存在しない。', function() {
			flow.should.not.have.property('Controller');
		});
	});
	describe('#Model', function() {
		it('モデルは存在しない。', function() {
			flow.should.not.have.property('Model');
		});
	});
	describe('#View', function() {
		it('ステータスコード404とともに、error404テンプレートを表示する。', function(done) {
			var checkStatus = false;
			var checkRender = false;
			response.status = function(errCode) {
				errCode.should.eql(404);
				checkStatus = true;
			};
			response.render = function(template, params) {
				template.should.eql('error404');
				checkRender = true;
			};
			var next = function() {
				checkRender.should.be.ok;
				checkStatus.should.be.ok;
				done();
			};
			flow.step('View', next)(request, response, nextFlow);
		});
	});
});
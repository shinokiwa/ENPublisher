var flow = require('../../../app/flows/Error404.js');
var stub,Stub = require('../../stub/index.js');

describe('Flows.Error404', function() {
	beforeEach(function() {
		stub = Stub();
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
			stub.response.status = function(errCode) {
				errCode.should.eql(404);
				checkStatus = true;
			};
			stub.response.render = function(template, params) {
				template.should.eql('error404');
				checkRender = true;
			};
			stub.flow.next = function () {
				checkRender.should.be.ok;
				checkStatus.should.be.ok;
				done();
			};
			flow.View(stub.flow, stub.request, stub.response);
		});
	});
});
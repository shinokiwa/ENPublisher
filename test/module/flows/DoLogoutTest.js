var flow = require('../../../app/flows/DoLogout.js');
var stub,Stub = require('../../stub/index.js');

describe('Flows.DoLogout', function() {
	beforeEach(function() {
		stub = Stub();
	});
	describe('#Controller', function() {
		it('request.session.loginedをfalseに変更し、/setting/login/にリダイレクトする。', function (done) {
			stub.response.redirect = function(status, url) {
				stub.request.session.should.have.property('logined', false);
				status.should.equal(302);
				url.should.equal('/setting/login/');
				done();
			};
			stub.flow.next =function (){
				throw new Error ('flow.next should not be called.');
			};
			flow.Controller(stub.flow, stub.request, stub.response);
		});
	});
	describe('#Model', function() {
		it('Modelは存在しない。', function() {
			flow.should.not.have.property('Model');
		});
	});
	describe('#View', function() {
		it('Viewは存在しない。', function() {
			flow.should.not.have.property('View');
		});
	});
});
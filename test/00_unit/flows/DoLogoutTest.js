var lib = require('../testlib.js');
var chai = lib.chai;
var expect = chai.expect;
chai.should();
var nextFlow = lib.nextFlow;
var flow, app, request, response;

describe('flows/DoLogout', function() {
	beforeEach(function(done) {
		app = lib.create(__dirname + '/../unittest.configure.json');
		app.ready(function(next) {
			flow = new app.flows.DoLogout();
			request = new lib.Request();
			response = new lib.Response();
			next();
			done();
		});
		app.process();
	});
	describe('#Controller', function() {
		it('request.session.loginedをfalseに変更し、/setting/login/にリダイレクトする。', function(done) {
			response.redirect = function(status, url) {
				request.session.should.have.property('logined', false);
				status.should.equal(302);
				url.should.equal('/setting/login/');
				done();
			};
			var next = function() {
			};
			flow.step('Controller', next)(request, response, nextFlow);
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
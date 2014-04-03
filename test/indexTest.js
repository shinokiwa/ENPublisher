var ENPublisher = require('../lib/index.js');
require('should');

describe('Index', function() {
	var app, flow, req, res;
	beforeEach(function() {
		app = new ENPublisher();
		flow = {
			events : new Array(),
			check : function(app, ev) {
				var self = this;
				app.once('Flow', function() {
					self.events.push(ev);
				});
			}
		};
		req = {
				testValue: 'Request!'
		};
		res = {
			redirect : function() {
			},
			render : function() {
			},
			testValue: 'Response!'
		};
	});
	describe('#flow()', function() {
		it('Emit Flow event', function(done) {
			app.once('Flow', function(params) {
				params.flow.should.equal('Index');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Controller event', function(done) {
			app.once('Controller', function(params) {
				params.flow.should.equal('Index');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Controller.Index event', function(done) {
			app.once('Controller.Index', function(request, params) {
				request.testValue.should.equal('Request!');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Model event', function(done) {
			app.once('Model', function(params) {
				params.flow.should.equal('Index');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Model.Index event', function(done) {
			app.once('Model.Index', function(requestParams, responseParams) {
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit View event', function(done) {
			app.once('View', function(params) {
				params.flow.should.equal('Index');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit View.Index event', function(done) {
			app.once('View.Index', function(response, params) {
				response.testValue.should.equal('Response!');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Order to call the event', function(done) {
			flow.check(app, 'Flow');
			flow.check(app, 'Controller');
			flow.check(app, 'Controller.Index');
			flow.check(app, 'Model');
			flow.check(app, 'Model.Index');
			flow.check(app, 'View');
			flow.check(app, 'View.Index');
			app.once('View.Index', function() {
				process.nextTick(function() {
					flow.events[0].should.equal('Flow');
					flow.events[1].should.equal('Controller');
					flow.events[2].should.equal('Controller.Index');
					flow.events[3].should.equal('Model');
					flow.events[4].should.equal('Model.Index');
					flow.events[5].should.equal('View');
					flow.events[6].should.equal('View.Index');
					done();
				});
			});
			app.flow('Index')(req, res);
		});
	});
});
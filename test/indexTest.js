var ENPublisher = require('../lib/index.js');
require('should');

describe('Index', function() {
	var req, res;
	beforeEach(function() {
		req = {
			testValue : 'Request!'
		};
		res = {
			redirect : function() {
			},
			render : function() {
			},
			testValue : 'Response!'
		};
	});
	describe('#flow()', function() {
		it('Emit Flow event', function(done) {
			var app = new ENPublisher();
			app.once('Flow', function(flow, params, next) {
				flow.should.equal('Index');
				next();
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Controller event', function(done) {
			var app = new ENPublisher();
			app.once('Controller', function(flow, params, next) {
				flow.should.equal('Index');
				next();
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Controller.Index event', function(done) {
			var app = new ENPublisher();
			app.once('Controller.Index', function(request, params, next) {
				request.testValue.should.equal('Request!');
				next();
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Model event', function(done) {
			var app = new ENPublisher();
			app.once('Model', function(flow, params, next) {
				flow.should.equal('Index');
				next();
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit Model.Index event', function(done) {
			var app = new ENPublisher();
			app.once('Model.Index', function(iParams, oParams, next) {
				next();
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit View event', function(done) {
			var app = new ENPublisher();
			app.once('View', function(flow, params, next) {
				flow.should.equal('Index');
				next();
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Emit View.Index event', function(done) {
			var app = new ENPublisher();
			app.once('View.Index', function(response, params) {
				response.testValue.should.equal('Response!');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Order to call the event', function(done) {
			var app = new ENPublisher();
			var flow = {
					events : new Array(),
					check : function(app, ev) {
						var self = this;
						app.once(ev, function(i, o, next) {
							self.events.push(ev);
							(next)?next():null;
						});
					}
				};
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
		it('Parameters IN/OUT', function(done) {
			var app = new ENPublisher();
			app.on('Controller.Index', function(request, params, next) {
				params.ControllerValue = 'test';
				next();
			});
			app.on('Model.Index', function(reqParams, resParams,next) {
				reqParams.ControllerValue.should.equal('test');
				resParams.ModelValue = reqParams.ControllerValue;
				next();
			});
			app.on('View.Index', function(response, params) {
				params.ModelValue.should.equal('test');
				done();
			});
			app.flow('Index')(req, res);
		});
		it('Process to flow as to run in the flow asynchronous processing',
				function(done) {
					var app = new ENPublisher();
					app.on('Controller.Index', function(request, params, next) {
						process.nextTick(function() {
							params.cTickValue = 'cTick!';
							next();
						});
					});
					app.on('Controller.Index', function(request, params, next) {
						var fs = require('fs');
						fs.exists(__dirname+'/indexTest.js', function(exists) {
							params.cFSValue = 'cFS!';
							next();
						});
					});
					app.on('Model.Index', function(reqParams, resParams, next) {
						reqParams.cTickValue.should.equal('cTick!');
						reqParams.cFSValue.should.equal('cFS!');
						process.nextTick(function() {
							resParams.mTickValue = 'mTick!';
							next();
						});
					});
					app.on('Model.Index', function(reqParams, resParams, next) {
						var fs = require('fs');
						fs.exists(__dirname+'/indexTest.js', function(exists) {
							resParams.mFSValue = 'mFS!';
							next();
						});
					});
					app.on('View.Index', function(response, params) {
						params.mTickValue.should.equal('mTick!');
						params.mFSValue.should.equal('mFS!');
						done();
					});
					app.flow('Index')(req, res);
				});
	});
});
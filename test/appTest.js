var ENPublisher = require('../lib/app.js');
require('should');

describe('App', function() {
	describe('#flow()', function() {
		it('Emit Before.Controller event', function(done) {
			var app = new ENPublisher();
			app.once('Before.Controller', function(req, i, next) {
				req.testValue.should.equal('Request!');
				next();
				done();
			});
			app.flow('Index')({testValue:'Request!'}, {});
		});
		it('Emit Controller.Index event', function(done) {
			var app = new ENPublisher();
			app.once('Controller.Index', function(request, params, next) {
				request.testValue.should.equal('Request!');
				next();
				done();
			});
			app.flow('Index')({testValue:'Request!'}, {});
		});
		it('Emit After.Controller event', function(done) {
			var app = new ENPublisher();
			app.once('After.Controller', function(request, params, next) {
				request.testValue.should.equal('Request!');
				next();
				done();
			});
			app.flow('Index')({testValue:'Request!'}, {});
		});
		it('Emit Before.Model event', function(done) {
			var app = new ENPublisher();
			app.once('Model.Index', function(i, o, next) {
				next();
				done();
			});
			app.flow('Index')({}, {});
		});
		it('Emit Model.Index event', function(done) {
			var app = new ENPublisher();
			app.once('Model.Index', function(iParams, oParams, next) {
				next();
				done();
			});
			app.flow('Index')({}, {});
		});
		it('Emit After.Model event', function(done) {
			var app = new ENPublisher();
			app.once('After.Model', function(i, o, next) {
				next();
				done();
			});
			app.flow('Index')({}, {});
		});
		it('Emit Before.View event', function(done) {
			var app = new ENPublisher();
			app.once('Before.View', function(response, params) {
				response.testValue.should.equal('Response!');
				done();
			});
			app.flow('Index')({}, {testValue:'Response!'});
		});
		it('Emit View.Index event', function(done) {
			var app = new ENPublisher();
			app.once('View.Index', function(response, params) {
				response.testValue.should.equal('Response!');
				done();
			});
			app.flow('Index')({}, {testValue:'Response!'});
		});
		it('Emit After.View event', function(done) {
			var app = new ENPublisher();
			app.once('After.View', function(response, params) {
				response.testValue.should.equal('Response!');
				done();
			});
			app.flow('Index')({}, {testValue:'Response!'});
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
			flow.check(app, 'Before.Controller');
			flow.check(app, 'Controller.Index');
			flow.check(app, 'After.Controller');
			flow.check(app, 'Before.Model');
			flow.check(app, 'Model.Index');
			flow.check(app, 'After.Model');
			flow.check(app, 'Before.View');
			flow.check(app, 'View.Index');
			flow.check(app, 'After.View');
			app.once('After.View', function() {
				process.nextTick(function() {
					flow.events[0].should.equal('Before.Controller');
					flow.events[1].should.equal('Controller.Index');
					flow.events[2].should.equal('After.Controller');
					flow.events[3].should.equal('Before.Model');
					flow.events[4].should.equal('Model.Index');
					flow.events[5].should.equal('After.Model');
					flow.events[6].should.equal('Before.View');
					flow.events[7].should.equal('View.Index');
					flow.events[8].should.equal('After.View');
					done();
				});
			});
			app.flow('Index')({}, {});
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
			app.flow('Index')({}, {});
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
					app.flow('Index')({}, {});
				});
	});
});
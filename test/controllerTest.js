var Controller = require('../lib/controller.js');
require('should');
var EventEmitter = require('events').EventEmitter;

describe('Controller', function() {
	describe('Index flow', function() {
		it('Do call controller.index when event of Index?', function(done) {
			var em = new EventEmitter();
			var controller = new Controller ();
			controller.bindTo(em);
			em.on ('Controller.Index', function (request, params) {
				process.nextTick (function () {
					params.page.should.equal(0);
					done();
				});
			});
			em.emit('Controller.Index', {}, {}, function () {});
		});
	});
});
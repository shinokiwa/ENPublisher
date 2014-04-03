var Controller = require('../lib/controller.js');
require('should');
var EventEmitter = require('events').EventEmitter;

describe('Controller', function() {
	var request, em;

	beforeEach(function() {
		em = new EventEmitter();
		Controller (em);
		request = {};
	});
	describe('Index flow', function() {
		it('Do call controller.index when event of Index?', function(done) {
			em.on ('Controller.Index', function (request, params) {
				process.nextTick (function () {
					params.Page.should.equal(0);
					done();
				});
			});
			em.emit('Controller.Index', request, {});
		});
	});
});
var model = require('../lib/model.js');
require('should');
var EventEmitter = require('events').EventEmitter;

describe('Controller', function() {
	var em;

	beforeEach(function() {
		em = new EventEmitter();
		model(em);
	});
	describe('Index flow', function() {
		it('Do call model.index when event of Index?', function(done) {
			em.on ('Model.Index', function (request, response) {
				process.nextTick (function () {
					//response.should.equal({});
					done();
				});
			});
			em.emit('Model.Index', {}, {});
		});
	});
});
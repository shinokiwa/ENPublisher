var Model = require('../lib/model.js');
require('should');
var EventEmitter = require('events').EventEmitter;

describe('Controller', function() {
	describe('Index flow', function() {
		it('Do call model.index when event of Index?', function(done) {
			var em = new EventEmitter();
			var model = new Model();
			model.bindTo(em);
			em.on('Model.Index', function(request, response) {
				process.nextTick(function() {
					// response.should.equal({});
					done();
				});
			});
			em.emit('Model.Index', {}, {}, function() {
			});
		});
	});
});
var view = require('../lib/view.js');
require('should');
var EventEmitter = require('events').EventEmitter;

describe('View', function() {
	var response;
	beforeEach(function() {
		response = {
			redirect : function() {
			},
			render : function() {
			}
		};
	});
	describe('Index Flow', function() {
		it('Do call view.render.express when event of Index?', function(done) {
			var em = new EventEmitter();
			view(em);
			response.render = function(template, params) {
				template.should.equal('index');
				params.value.should.eql('Test!');
				done();
			};
			em.emit('View.Index', response, {
				value : "Test!"
			});
		});
	});
});
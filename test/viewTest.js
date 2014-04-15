var View = require('../lib/view.js');
require('should');
var EventEmitter = require('events').EventEmitter;

describe('View', function() {
	describe('Index Flow', function() {
		it('Do call response.render() when event of Index?', function(done) {
			var em = new EventEmitter();
			var view = new View();
			view.bindTo(em);
			em.emit('View.Index', {
				render : function(template, params) {
					template.should.equal('index');
					params.value.should.eql('Test!');
					done();
				}
			}, {
				value : "Test!"
			}, function () {});
		});
	});
});
var express = require('../lib/views/renders/express.js');
require('should');

describe('view.render.express', function() {
	var request, response;

	beforeEach(function() {
		request = {};
		response = {
			redirect : function() {
			},
			render : function() {
			}
		};
	});
	describe('template', function() {
		it('Do call Express API: response.render()?', function(done) {
			response.render = function(template, params) {
				template.should.equal('index');
				params.value.should.eql('Express');
				done();
			};
			var render = express.template ('index');
			render (response,{
				value : "Express"
			});
		});
	});
});
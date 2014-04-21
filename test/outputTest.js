var Output = require('../lib/output.js');
require('should');

describe('Output', function() {
	describe('#session()', function() {
		it('can use session handler', function (done) {
			var req = {
					session: {
						testValue: 'test!'
					}
			};
			var output = new Output(req);
			var session = output.session();
			session.testValue.should.equal('test!');
			session.testValue = 'test2!';
			req.session.testValue.should.equal('test2!');
			done();
		});
	});
});
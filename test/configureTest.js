var Configure = require('../lib/configure.js');
require('should');

describe('Configure', function() {
	describe('#load()', function () {
		it('Load configure.json not exists', function(done) {
			Configure.load(__dirname + '/aaa', function (){
				Configure.isLoaded.should.equal(false);
				done();
			});
		});
		it('Load configure.json exists', function(done) {
			Configure.load(__dirname + '/testconfigure.json', function (){
				Configure.isLoaded.should.equal(true);
				done();
			});
		});
	});
});
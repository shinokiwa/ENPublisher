var common = require('../lib/flows/common.js');
require('should');

describe('common.view', function() {
	var view = common.view;
	describe('#tempalte', function() {
		it('Call response.render() and through parameters', function(done) {
			view.template('index')({
				render: function (template, params) {
					params.testValue.should.equal('View!');
					template.should.equal('index');
					done();
				}
			},{
				testValue: 'View!'
			});
		});
	});
	describe('#redirect', function() {
		it('Call response.redirect() when 301 redirect', function(done) {
			view.redirect('301', '/')({
				redirect: function (status, url) {
					status.should.equal('301');
					url.should.equal('/');
					done();
				}
			},{
				testValue: 'View!'
			});
		});
		it('Call response.redirect() when 302 redirect', function(done) {
			view.redirect('302', '/Setting/Login')({
				redirect: function (status, url) {
					status.should.equal('302');
					url.should.equal('/Setting/Login');
					done();
				}
			},{
				testValue: 'View!'
			});
		});
	});

	describe('#error', function() {
		it('Call response.render() and response.status()', function(done) {
			var checkStatus = false;
			view.error('404')({
				status: function (code) {
					code.should.equal('404');
					checkStatus = true;
				},
				render: function (template, params) {
					params.testValue.should.equal('View!');
					template.should.equal('error404');
					checkStatus.should.equal(true);
					done();
				}
			},{
				testValue: 'View!'
			});
		});
	});
});

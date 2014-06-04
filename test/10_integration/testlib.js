delete (require.cache['evernote']);

var testReq = module.exports.require = function (module) {
	if (process.env.TEST_COV) {
		return require(__dirname+'/../../app-cov/'+module);
	} else {
		return require(__dirname+'/../../app/'+module);
	}
};

var sinon = module.exports.sinon = require('sinon');
var chai = module.exports.chai = require('chai');
var app = module.exports.app = testReq ('index.js').create(__dirname+'/configure.json');

module.exports.Request = function() {
	this.params = {};
	this.query = {};
	this.body = {};
	this.session = {};
};
module.exports.Response = function() {
	this.locals = {};
};

before (function (done) {
	app.ready(function (next) {
		done();
		next();
	});
	app.process();
});
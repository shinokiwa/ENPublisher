require ('./data/evernote.js');

var testReq = module.exports.require = function (module) {
	if (process.env.TEST_COV) {
		return require(__dirname+'/../../app-cov/'+module);
	} else {
		return require(__dirname+'/../../app/'+module);
	}
};

var sinon = module.exports.sinon = require('sinon');
var chai = module.exports.chai = require('chai');
var create = module.exports.create = testReq ('index.js').create;
var database = module.exports.databaseInit = require ('./data/db.js');

module.exports.nextFlow = function () {
};

module.exports.Request = function() {
	this.params = {};
	this.query = {};
	this.body = {};
	this.session = {};
};
module.exports.Response = function() {
	this.locals = {};
};


var testReq = module.exports.require = function (module) {
	if (process.env.TEST_COV) {
		return require(__dirname+'/../../app-cov/'+module);
	} else {
		return require(__dirname+'/../../app/'+module);
	}
};

var sinon = module.exports.sinon = require('sinon');
var chai = module.exports.chai = require('chai');

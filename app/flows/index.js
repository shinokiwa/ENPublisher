/**
 * Index flow
 * author shinokiwa@gmail.com
 */
var common = require ('./common.js');

module.exports.c = function (req, prm, next) {
	prm.page = 0;
	next();
};

module.exports.m = function (inPrms, outPrms, next) {
	next();
};

module.exports.v = common.view.template('index'); 
/**
 * Index flow
 * author shinokiwa@gmail.com
 */
var common = require ('./common.js');

module.exports.controller = function (req, prm, next) {
	prm.page = 0;
	next();
};

module.exports.model = function (inPrms, outPrms, next) {
	next();
};

module.exports.view = common.view.template('index'); 
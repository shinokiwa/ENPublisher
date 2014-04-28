var common = require ('./common.js');

module.exports.controller = common.controller.requireAuth;
module.exports.model = function(input, output, next) {
	common.model.requireAuth(input, output, function (){
		var sync = input.components.sync();
		sync.doSyncAll();
		next();
	});
};
module.exports.view = common.view.redirect(302, 'setting/sync/');